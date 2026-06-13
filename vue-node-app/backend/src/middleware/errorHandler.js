function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan server.',
    data: null,
  });
}

module.exports = errorHandler;
