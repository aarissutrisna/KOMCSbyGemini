
export const sendSuccess = (res, message = 'Success', data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, message = 'Error', status = 500) => {
  return res.status(status).json({
    success: false,
    message
  });
};
