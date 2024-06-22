class Tele2Ats2ClientError extends Error {
  /**
   * @param { string | Error } [error]
   */
  constructor(error) {
    if (typeof error === "string") {
      super(error);
      this.error = new Error(error);
    } else if (error instanceof Error) {
      super(error.message || Object.getPrototypeOf(error)?.constructor?.name);
      this.error = error;
    } else {
      const msg = error + "" || "unknown error";
      super(msg);
      this.error = new Error(msg);
    }
  }
}

class Tele2Ats2ClientLossTruthTokenError extends Tele2Ats2ClientError {}
class Tele2Ats2ClientProxyError extends Tele2Ats2ClientError {}

module.exports = {
  Tele2Ats2ClientError,
  Tele2Ats2ClientLossTruthTokenError,
  Tele2Ats2ClientProxyError,
};
