import logStream from './morganLogs.js'; // Import the log stream

const errorHandler = (err, req, res, next) => {
  // Log the error stack for debugging
  console.error(err.stack);
  
  // Log error to the log file
  logStream.write(`[${new Date().toISOString()}] Error: ${err.message}\n`);

  // Check if error is a custom error with a status code
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Send response with the error message
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null, // Show stack in dev mode only
  });
};

export default errorHandler;
