class Tele2Ats2ApiError extends Error {}

class Tele2Ats2ApiUnauthorizedError extends Tele2Ats2ApiError {}
class Tele2Ats2ApiEmployeeNotFoundError extends Tele2Ats2ApiError {}

module.exports = {
  Tele2Ats2ApiError,
  Tele2Ats2ApiUnauthorizedError,
  Tele2Ats2ApiEmployeeNotFoundError,
};
