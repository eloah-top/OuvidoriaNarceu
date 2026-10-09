// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status,
    },
  });
}
