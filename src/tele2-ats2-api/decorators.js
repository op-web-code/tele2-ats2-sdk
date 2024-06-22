const Exceptions = require("./exceptions");

const isAxiosError = (error) => {
  return error instanceof Error && "response" in error;
};

/**
 * @template T
 * @param { Promise<T> } axiosPromise
 * @param { { exception: new (...args: Parameters<typeof Exceptions.Tele2Ats2ApiError>) => Exceptions.Tele2Ats2ApiError, code: number, details?: string, message?: string }[] } handlers
 * @throws { Exceptions.Tele2Ats2ApiError }
 */
const decoratorTele2Ats2ApiError = async (axiosPromise, handlers) => {
  try {
    return await axiosPromise;
  } catch (error) {
    if (error instanceof Exceptions.Tele2Ats2ApiError) {
      throw error;
    }
    if (!isAxiosError(error)) {
      throw new Exceptions.Tele2Ats2ApiError(
        error?.message ?? error + "" ?? "unknown error"
      );
    }
    for (const handler of handlers) {
      if (error.response.status !== handler.code) {
        continue;
      }
      if (handler.message && error.response.data?.message !== handler.message) {
        continue;
      }
      if (handler.details && error.response.data?.details !== handler.details) {
        continue;
      }
      throw new handler.exception();
    }
    throw new Exceptions.Tele2Ats2ApiError(
      error?.message ?? error + "" ?? "unknown error"
    );
  }
};

module.exports = {
  decoratorTele2Ats2ApiError,
};
