const axios = require("axios");

const Tele2Ats2File = require("./file");
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
    details: "Tele2 Server Error",
    exception: Exceptions.Tele2Ats2ApiServerError,
  },
];

/**
 * @param { object } props
 * @param { string } props.accessToken
 * @param { Date } props.dateFrom
 * @param { Date } props.dateTo
 * @param { number } [props.page]
 * @param { number } [props.size]
 * @param { { key: string, order: 'asc' | 'desc' } } [props.sort]
 * @param { string } [props.callee]
 * @param { string } [props.caller]
 * @param { boolean } [props.hasRecorded]
 * @returns { Promise<void> }
 */
const callRecordsInfo = async (props) => {
  const url = new URL(`${Constants.TELE2APIHOST}/call-records/info`);

  if (props.callee) {
    url.searchParams.set("callee", props.callee);
  }
  if (props.caller) {
    url.searchParams.set("caller", props.caller);
  }
  if (props.hasRecorded) {
    url.searchParams.set("is_recorded", props.hasRecorded);
  }
  if (props.page) {
    url.searchParams.set("page", props.page);
  }
  if (props.size) {
    url.searchParams.set("size", props.size);
  }
  if (props.dateFrom) {
    url.searchParams.set("start", props.dateFrom.toISOString());
  }
  if (props.dateTo) {
    url.searchParams.set("end", props.dateTo.toISOString());
  }
  if (props.sort) {
    url.searchParams.set(
      "sort",
      `${props.sort.key},${props.sort.order.toUpperCase()}`
    );
  }

  const { data } = await decoratorTele2Ats2ApiError(
    axios.default.get(url.toString(), {
      headers: {
        Authorization: props.accessToken,
      },
    }),
    DEFAULTS_DECORATORS
  );

  return data.map((item) => {
    if (item.recordFileName) {
      const url = new URL(`${Constants.TELE2APIHOST}/call-records/file`);
      url.searchParams.set("filename", item.recordFileName);

      return {
        ...item,
        recordFileUri: url.toString(),
        date: new Date(item.date),
      };
    }

    return item;
  });
};

/**
 * @param { object } props
 * @param { string } props.accessToken
 * @param { string } props.recordFileName
 */
const callRecordsFile = async (props) => {
  const url = new URL(`${Constants.TELE2APIHOST}/call-records/file`);
  url.searchParams.set("filename", props.recordFileName);

  const res = await decoratorTele2Ats2ApiError(
    axios.default.get(url.toString(), {
      headers: {
        Authorization: props.accessToken,
        "Content-Type": "audio/mpeg",
      },
      responseType: "stream",
    }),
    DEFAULTS_DECORATORS
  );
  return new Tele2Ats2File(res.data);
};

module.exports = {
  callRecordsInfo,
  callRecordsFile,
};
