function errorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
//console.log("Error Middleware: ", err.message, "Status Code: ", statusCode);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

export default errorMiddleware;