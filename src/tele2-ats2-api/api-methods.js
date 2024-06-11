const axios = require("axios");

const Exceptions = require("./exceptions");
const Constants = require("./constants");
const { decoratorTele2Ats2ApiError } = require("./decorators");

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
 * @param { object } props
 * @param { string } props.refreshToken
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
      }
    ),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * @param { object } props
 * @param { string } props.accessToken
 * @returns { Promise<Record<string, any>> }
 */
const monitoringCalls = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/monitoring/calls`, {
      headers: {
        Authorization: props.accessToken,
      },
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * @param { object } props
 * @param { string } props.accessToken
 * @returns { Promise<Record<string, any>> }
 */
const monitoringCallsPending = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/monitoring/calls/pending`, {
      headers: {
        Authorization: props.accessToken,
      },
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * @param { object } props
 * @param { string } props.accessToken
 * @returns { Promise<Record<string, any>> }
 */
const employees = async (props) => {
  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(`${Constants.TELE2APIHOST}/employees`, {
      headers: {
        Authorization: props.accessToken,
      },
    }),
    DEFAULTS_DECORATORS
  );
  return data;
};

/**
 * @param { object } props
 * @param { string } props.accessToken
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
