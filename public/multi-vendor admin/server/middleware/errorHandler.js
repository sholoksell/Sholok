const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("[ERROR]", err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = { message: `Resource not found (id: ${err.value})`, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = { message: `Duplicate value: '${value}' for field '${field}'.`, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = { message: messages.join(". "), statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = { message: "Invalid token.", statusCode: 401 };
  }
  if (err.name === "TokenExpiredError") {
    error = { message: "Token expired. Please log in again.", statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
