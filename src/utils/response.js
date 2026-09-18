export const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json(data);
};

export const sendError = (res, message, status = 400, details = null) => {
  const payload = { message };

  if (details) {
    payload.details = details;
  }

  return res.status(status).json(payload);
};

export default { sendSuccess, sendError };
