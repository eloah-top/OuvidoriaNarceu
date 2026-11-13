import { Turma, TURNOS } from '../models/Turma.js';

export async function list(_req, res, next) {
  try {
    const items = await Turma.findAll({ where: { ativo: true }, order: [['nome', 'ASC'], ['turno', 'ASC']] });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await Turma.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Turma não encontrada', status: 404 } });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { nome, turno } = req.body || {};
    if (typeof nome !== 'string' || nome.trim().length < 2) {
      return res.status(400).json({ error: { message: 'nome deve ter ao menos 2 caracteres', status: 400 } });
    }
    if (turno && !TURNOS.includes(turno)) {
      return res.status(400).json({ error: { message: `turno deve ser um de: ${TURNOS.join(', ')}`, status: 400 } });
    }
    const item = await Turma.create({ nome: nome.trim(), turno: turno || 'diurno', ativo: true });
    res.status(201).json(item);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: { message: 'Turma já cadastrada', status: 409 } });
    }
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const item = await Turma.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Turma não encontrada', status: 404 } });
    const { nome, turno, ativo } = req.body || {};
    const payload = {};
    if (nome !== undefined) payload.nome = String(nome).trim();
    if (turno !== undefined) {
      if (!TURNOS.includes(turno)) {
        return res.status(400).json({ error: { message: `turno deve ser um de: ${TURNOS.join(', ')}`, status: 400 } });
      }
      payload.turno = turno;
    }
    if (ativo !== undefined) payload.ativo = Boolean(ativo);
    await item.update(payload);
    res.json(item);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: { message: 'Turma já cadastrada', status: 409 } });
    }
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const item = await Turma.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Turma não encontrada', status: 404 } });
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
