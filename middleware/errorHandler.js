const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.code === 'PERMISSION_DENIED') {
    return res.status(403).json({
      success: false,
      error: 'Permission denied'
    });
  }

  if (err.code === 'UNAUTHENTICATED') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

module.exports = errorHandler;
