const axios = require("axios-https-proxy-fix");

const Exceptions = require("./exceptions");
const Constants = require("./constants");
const { decoratorTele2Ats2ApiError } = require("./decorators");
const { proxyHttpToAxiosProxy } = require("./utils");

const DEFAULTS_DECORATORS = [
  {
    code: 403,
    details: "The token has already been updated",
    exception: Exceptions.Tele2Ats2ApiUnauthorizedError,
  },
  {
    code: 500,
    exception: Exceptions.Tele2Ats2ApiServerError,
  },
];

/**
 * Обновление токена
 *
 * @see https://ats2-wiki.tele2.ru/open_api/#_4
 *
 * @param { object } props
 * @param { string } props.refreshToken
 * @param { import('../../types').ProxyHttp } [props.proxy]
 * @returns { Promise<{ accessToken: string, refreshToken: string }> }
 */
const refreshTokens = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.put(
      `${Constants.TELE2APIHOST}/authorization/refresh/token`,
      undefined,
      {
        headers: {
          Authorization: props.refreshToken,
        },
        proxy: proxyHttpToAxiosProxy(props.proxy),
      }
    ),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * Получение информации о текущих звонках
 *
 * @see https://ats2-wiki.tele2.ru/open_api/#_5
 *
 * @param { object } props
 * @param { string } props.accessToken
 * @param { import('../../types').ProxyHttp } [props.proxy]
 * @returns { Promise<Record<string, any>> }
 */
const monitoringCalls = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/monitoring/calls`, {
      headers: {
        Authorization: props.accessToken,
      },
      proxy: proxyHttpToAxiosProxy(props.proxy),
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * Получение списка абонентов в очереди
 *
 * @see https://ats2-wiki.tele2.ru/open_api/#_6
 *
 * @param { object } props
 * @param { string } props.accessToken
 * @param { import('../../types').ProxyHttp } [props.proxy]
 * @returns { Promise<Record<string, any>> }
 */
const monitoringCallsPending = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/monitoring/calls/pending`, {
      headers: {
        Authorization: props.accessToken,
      },
      proxy: proxyHttpToAxiosProxy(props.proxy),
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * Получение списка сотрудников компании
 *
 * @see https://ats2-wiki.tele2.ru/open_api/#_7
 *
 * @param { object } props
 * @param { string } props.accessToken
 * @param { import('../../types').ProxyHttp } [props.proxy]
 * @returns { Promise<Record<string, any>> }
 */
const employees = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/employees`, {
      headers: {
        Authorization: props.accessToken,
      },
      proxy: proxyHttpToAxiosProxy(props.proxy),
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * Сlick 2 call (вызов через АТС)
 *
 * @see https://ats2-wiki.tele2.ru/open_api/#lick-2-call
 *
 * @param { object } props
 * @param { string } props.accessToken
 * @param { import('../../types').ProxyHttp } [props.proxy]
 * @param { string } props.employeePhone
 * @param { string } props.clientPhone
 * @returns { Promise<void> }
 */
const click2call = async (props) => {
  const url = new URL(`${Constants.TELE2APIHOST}/call/outgoing/`);
  url.searchParams.set("source", props.employeePhone);
  url.searchParams.set("destination", props.clientPhone);

  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.post(url.toString(), undefined, {
      headers: {
        Authorization: props.accessToken,
      },
      proxy: proxyHttpToAxiosProxy(props.proxy),
    }),
    [
      ...DEFAULTS_DECORATORS,
      { code: 404, exception: Exceptions.Tele2Ats2ApiEmployeeNotFoundError },
    ]
  );
  return data;
};

module.exports = {
  refreshTokens,
  monitoringCalls,
  monitoringCallsPending,
  employees,
  click2call,
};
