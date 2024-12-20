import logger from "./logger.js";

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error details
  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : "Hidden",
    ...(req.body && { requestBody: req.body }),
  };

  // Log the error using Winston
  logger.error(JSON.stringify(errorDetails, null, 2));

  // Send a proper JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export default errorHandler;
