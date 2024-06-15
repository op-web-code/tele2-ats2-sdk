const tele2ats2api = require("../tele2-ats2-api/");
const AbstractTokenStore = require("./token-store.abstract");
const Exceptions = require("./exceptions");

class Tele2Ats2ClientAuth {
  #tokenStore;
  #attempts;

  /** @type { null | string } */
  #tokenStoreAccessToken = null;
  /** @type { null | Promise<string> } */
  #tokenStoreRunnedStrategy = null;

  /**
   * @param { object } props
   * @param { AbstractTokenStore } props.tokenStore
   * @param { object } [props.strategyConfig]
   * @param { number[] } props.strategyConfig.attempts
   */
  constructor(props) {
    this.#tokenStore = props.tokenStore;
    this.#attempts = props.strategyConfig?.attempts || [1000, 3000, 5000];
  }

  /**
   * Загрузить accessToken
   *
   * 1. Если есть в памяти вернём его
   * 2. Если есть в сторе вернём его
   * 3. Иначе выполняем стратегию авторизации
   */
  async #getAccessToken() {
    if (this.#tokenStoreAccessToken) {
      return this.#tokenStoreAccessToken;
    }

    const { accessToken } = await this.#tokenStore.loadAccessToken();
    if (accessToken) {
      this.#tokenStoreAccessToken = accessToken;
      return accessToken;
    }

    return this.runStrategyAuth();
  }

  /**
   * (Этот метод должен быть синхроным)
   * @protected
   */
  runStrategyAuth() {
    if (this.#tokenStoreRunnedStrategy) {
      return this.#tokenStoreRunnedStrategy;
    }

    this.#tokenStoreAccessToken = null;
    this.#tokenStoreRunnedStrategy = this.#strategyAuth().finally(() => {
      this.#tokenStoreRunnedStrategy = null;
    });
    return this.#tokenStoreRunnedStrategy;
  }

  /**
   * Страатегия авторизации:
   * 1. Загрузить refreshToken
   * 2. Запросить пару из accessToken и refreshToken
   *    - Если все ок - вернём accessToken
   *    - Если нет, пробуем получить accessToken из стора (предполагается,
   *      что кто-то другой изменил токен - например крона, которая запускает
   *      принудительную авторизацию каждый день)
   *
   * @returns { Promise<string> }
   */
  async #strategyAuth() {
    const { refreshToken } = await this.#tokenStore.loadRefreshToken();

    const firstTryAuth = await tele2ats2api
      .refreshTokens({
        refreshToken,
      })
      .then((ok) => ({ ok }))
      .catch((err) => ({ err }));

    if ("ok" in firstTryAuth) {
      await this.#tokenStore.saveTokens(firstTryAuth.ok);

      this.#tokenStoreAccessToken = firstTryAuth.ok.accessToken;
      return firstTryAuth.ok.accessToken;
    }

    for (const delay of this.#attempts) {
      await this.#sleep(delay);
      const { accessToken } = await this.#tokenStore.loadAccessToken();

      if (accessToken) {
        this.#tokenStoreAccessToken = accessToken;
        return accessToken;
      }
    }

    this.#throwLossTruthTokenError(firstTryAuth.err?.message);
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * @protected
   * @param { (tokenAccess: string) => Promise<any> } callApi
   * @returns { Promise<any> }
   */
  async callApiMethod(callApi) {
    try {
      const accessToken = await this.#getAccessToken();
      return await callApi(accessToken);
    } catch (error) {
      if (!(error instanceof tele2ats2api.Tele2Ats2ApiUnauthorizedError)) {
        throw new Exceptions.Tele2Ats2ClientError(error);
      }

      try {
        const accessToken = await this.runStrategyAuth();
        return await callApi(accessToken);
      } catch (error) {
        if (error instanceof tele2ats2api.Tele2Ats2ApiUnauthorizedError) {
          this.#throwLossTruthTokenError(error.message);
        }

        throw new Exceptions.Tele2Ats2ClientError(error);
      }
    }
  }

  /** @returns { never } */
  #throwLossTruthTokenError(msg) {
    throw new Exceptions.Tele2Ats2ClientLossTruthTokenError(
      "Maybe all tokens are expired?" + msg ? " (" + msg + ")" : ""
    );
  }
}

class Tele2Ats2Client extends Tele2Ats2ClientAuth {
  /**
   * @param { object } props
   * @param { AbstractTokenStore } props.tokenStore
   * @param { object } [props.strategyConfig]
   * @param { number[] } props.strategyConfig.attempts
   */
  constructor(props) {
    super(props);
  }

  async forcedAuth() {
    await this.runStrategyAuth();
  }

  /**
   * Получение списка сотрудников компании
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#_7
   *
   * @returns { Promise<import('../../types').Employee[]> }
   */
  async employees() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.employees({ accessToken })
    );
  }

  /**
   * Получение информации о текущих звонках
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#_5
   *
   * @returns { Promise<import('../../types').MonitoringCall[]> }
   */
  async monitoringCalls() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.monitoringCalls({ accessToken })
    );
  }

  /**
   * Получение списка абонентов в очереди
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#_6
   *
   * @returns { Promise<import('../../types').MonitoringCallPending[]> }
   */
  async monitoringCallsPending() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.monitoringCallsPending({ accessToken })
    );
  }

  /**
   * Сlick 2 call (вызов через АТС)
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#lick-2-call
   *
   * @param { Omit<Parameters<import('../tele2-ats2-api')['click2call']>[0], 'accessToken'> } props
   * @returns { Promise<void> }
   */
  async click2call(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.click2call({ accessToken, ...props })
    );
  }

  /**
   * Получение списка записей разговоров
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#_13
   *
   * @param { Omit<Parameters<import('../tele2-ats2-api')['callRecordsInfo']>[0], 'accessToken' | 'sort'> & { sort?: { key: 'date' | 'callTimestamp' | 'callType' | 'destinationNumber' | 'callerNumber' | 'callerName' | 'calleeNumber' | 'calleeName' | 'callDuration' | 'callStatus' | 'recordFileName', order: 'asc' | 'desc' } } } props
   * @returns { Promise<import('../../types').FileInfo[]> }
   */
  async callRecordsInfo(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.callRecordsInfo({ accessToken, ...props })
    );
  }

  /**
   * Получение файла записи разговора
   *
   * @see https://ats2-wiki.tele2.ru/open_api/#_14
   *
   * @param { Omit<Parameters<import('../tele2-ats2-api')['callRecordsFile']>[0], 'accessToken'> } props
   * @returns { Promise<import('../tele2-ats2-api/file')> }
   */
  async callRecordsFile(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.callRecordsFile({ accessToken, ...props })
    );
  }
}

module.exports = Tele2Ats2Client;
