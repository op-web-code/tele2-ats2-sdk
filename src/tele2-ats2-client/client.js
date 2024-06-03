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

  async #getAccessToken() {
    if (this.#tokenStoreAccessToken) {
      return this.#tokenStoreAccessToken;
    }

    const { accessToken } = await this.#tokenStore.loadTokens();
    if (accessToken) {
      this.#tokenStoreAccessToken = accessToken;
      return accessToken;
    }

    return this.runStrategyAuth();
  }

  /**
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

  /** @returns { Promise<string> } */
  async #strategyAuth() {
    const { refreshToken } = await this.#tokenStore.loadTokens();

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
      const { accessToken } = await this.#tokenStore.loadTokens();

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
   * @returns { Promise<import('../../types').Employee[]> }
   */
  async employees() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.employees({ accessToken })
    );
  }

  /**
   * @returns { Promise<import('../../types').MonitoringCall[]> }
   */
  async monitoringCalls() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.monitoringCalls({ accessToken })
    );
  }

  /**
   * @returns { Promise<import('../../types').MonitoringCallPending[]> }
   */
  async monitoringCallsPending() {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.monitoringCallsPending({ accessToken })
    );
  }

  /**
   * @param { Omit<Parameters<import('../tele2-ats2-api')['click2call']>[0], 'accessToken'> } props
   * @returns { Promise<void> }
   */
  async click2call(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.click2call({ accessToken, ...props })
    );
  }

  /**
   * @param { Omit<Parameters<import('../tele2-ats2-api')['callRecordsInfo']>[0], 'accessToken' | 'sort'> & { sort?: { key: 'date' | 'callTimestamp' | 'callType' | 'destinationNumber' | 'callerNumber' | 'callerName' | 'calleeNumber' | 'calleeName' | 'callDuration' | 'callStatus' | 'recordFileName', order: 'asc' | 'desc' } } } props
   * @returns { Promise<import('../../types').FileInfo[]> }
   */
  async callRecordsInfo(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.callRecordsInfo({ accessToken, ...props })
    );
  }

  /**
   * @param { object } props
   * @param { Omit<Parameters<import('../tele2-ats2-api')['click2call']>[0], 'callRecordsFile'> } props
   * @returns { Promise<import('../tele2-ats2-api/file')> }
   */
  async callRecordsFile(props) {
    return this.callApiMethod((accessToken) =>
      tele2ats2api.callRecordsFile({ accessToken, ...props })
    );
  }
}

module.exports = Tele2Ats2Client;
