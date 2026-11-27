// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}:`, err);
  }
  res.status(status).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status,
    },
  });
}
