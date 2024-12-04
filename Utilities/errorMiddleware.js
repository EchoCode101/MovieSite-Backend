// errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Check if error is a custom error with a status code
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null, // Show stack in dev mode only
  });
};

export default errorHandler;
