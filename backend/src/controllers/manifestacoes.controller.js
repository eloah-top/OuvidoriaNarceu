// Modelo em memória — troque por banco (Prisma/Drizzle/Sequelize) depois.
let seq = 1;
const store = [];

const TIPOS = ['denuncia', 'reclamacao', 'sugestao', 'elogio', 'solicitacao'];

function validate(data, partial = false) {
  const errors = [];
  if (!partial || data.tipo !== undefined) {
    if (!TIPOS.includes(data.tipo)) errors.push(`tipo deve ser um de: ${TIPOS.join(', ')}`);
  }
  if (!partial || data.titulo !== undefined) {
    if (typeof data.titulo !== 'string' || data.titulo.trim().length < 3) {
      errors.push('titulo deve ter ao menos 3 caracteres');
    }
  }
  if (!partial || data.descricao !== undefined) {
    if (typeof data.descricao !== 'string' || data.descricao.trim().length < 5) {
      errors.push('descricao deve ter ao menos 5 caracteres');
    }
  }
  return errors;
}

export function list(_req, res) {
  res.json(store);
}

export function getById(req, res) {
  const item = store.find((m) => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });
  res.json(item);
}

export function create(req, res) {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: { message: errors.join('; '), status: 400 } });

  const item = {
    id: seq++,
    tipo: req.body.tipo,
    titulo: req.body.titulo.trim(),
    descricao: req.body.descricao.trim(),
    status: 'aberta',
    createdAt: new Date().toISOString(),
  };
  store.push(item);
  res.status(201).json(item);
}

export function update(req, res) {
  const item = store.find((m) => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });

  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ error: { message: errors.join('; '), status: 400 } });

  Object.assign(item, {
    ...(req.body.tipo && { tipo: req.body.tipo }),
    ...(req.body.titulo && { titulo: req.body.titulo.trim() }),
    ...(req.body.descricao && { descricao: req.body.descricao.trim() }),
    ...(req.body.status && { status: req.body.status }),
    updatedAt: new Date().toISOString(),
  });
  res.json(item);
}

export function remove(req, res) {
  const idx = store.findIndex((m) => m.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });
  store.splice(idx, 1);
  res.status(204).end();
}
