export function notFound(_req, _res, next) {
  const err = new Error('Rota não encontrada');
  err.status = 404;
  next(err);
}
