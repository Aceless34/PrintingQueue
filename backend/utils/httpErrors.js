const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getErrorStatus = (error) => {
  if (error && Number.isInteger(error.status)) return error.status;
  return 500;
};

module.exports = { createHttpError, getErrorStatus };
