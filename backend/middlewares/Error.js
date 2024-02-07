const ErrorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error!";
  
    const errorResponse = {
      success: false,
      message: message,
    };
  
    res.status(statusCode).json(errorResponse);
  };
  
  export default ErrorMiddleware;
  