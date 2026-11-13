import { Op } from 'sequelize';
import { Manifestacao, TIPOS, SETORES, STATUS } from '../models/Manifestacao.js';
import { Turma } from '../models/Turma.js';

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
  if (data.setor !== undefined && data.setor !== null && !SETORES.includes(data.setor)) {
    errors.push(`setor deve ser um de: ${SETORES.join(', ')}`);
  }
  if (data.status !== undefined && !STATUS.includes(data.status)) {
    errors.push(`status deve ser um de: ${STATUS.join(', ')}`);
  }
  if (data.anonimo !== undefined && typeof data.anonimo !== 'boolean') {
    errors.push('anonimo deve ser boolean');
  }
  return errors;
}

function buildProtocolo(id) {
  const year = new Date().getFullYear();
  return `NRC-${year}-${String(id).padStart(4, '0')}`;
}

export async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.tipo) where.tipo = req.query.tipo;
    if (req.query.setor) where.setor = req.query.setor;
    if (req.query.q) {
      const q = `%${req.query.q}%`;
      where[Op.or] = [
        { titulo: { [Op.like]: q } },
        { descricao: { [Op.like]: q } },
        { protocolo: { [Op.like]: q } },
      ];
    }
    const items = await Manifestacao.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await Manifestacao.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function getByProtocolo(req, res, next) {
  try {
    const item = await Manifestacao.findOne({ where: { protocolo: req.params.protocolo } });
    if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ error: { message: errors.join('; '), status: 400 } });

    let turmaId = null;
    let turmaNome = null;
    if (!req.body.anonimo && req.body.turma) {
      const turma = await Turma.findOne({ where: { nome: req.body.turma, ativo: true } });
      if (!turma) {
        return res.status(400).json({ error: { message: 'turma não encontrada', status: 400 } });
      }
      turmaId = turma.id;
      turmaNome = turma.nome;
    }

    const last = await Manifestacao.findOne({ order: [['id', 'DESC']] });
    const protocolo = buildProtocolo((last?.id || 0) + 1);

    const item = await Manifestacao.create({
      protocolo,
      tipo: req.body.tipo,
      titulo: req.body.titulo.trim(),
      descricao: req.body.descricao.trim(),
      setor: req.body.setor || null,
      turma: req.body.anonimo ? null : (turmaNome || null),
      turmaId: req.body.anonimo ? null : turmaId,
      nome: req.body.anonimo ? null : (req.body.nome?.trim() || null),
      contato: req.body.anonimo ? null : (req.body.contato?.trim() || null),
      anonimo: Boolean(req.body.anonimo),
      status: 'aberta',
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const item = await Manifestacao.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });

    const errors = validate(req.body, true);
    if (errors.length) return res.status(400).json({ error: { message: errors.join('; '), status: 400 } });

    const payload = {};
    if (req.body.tipo) payload.tipo = req.body.tipo;
    if (req.body.titulo) payload.titulo = req.body.titulo.trim();
    if (req.body.descricao) payload.descricao = req.body.descricao.trim();
    if (req.body.setor !== undefined) payload.setor = req.body.setor || null;
    if (req.body.turma !== undefined) {
      if (req.body.anonimo) {
        payload.turma = null;
        payload.turmaId = null;
      } else if (req.body.turma) {
        const turma = await Turma.findOne({ where: { nome: req.body.turma, ativo: true } });
        if (!turma) {
          return res.status(400).json({ error: { message: 'turma não encontrada', status: 400 } });
        }
        payload.turma = turma.nome;
        payload.turmaId = turma.id;
      } else {
        payload.turma = null;
        payload.turmaId = null;
      }
    }
    if (req.body.nome !== undefined) payload.nome = req.body.anonimo ? null : (req.body.nome?.trim() || null);
    if (req.body.contato !== undefined) payload.contato = req.body.anonimo ? null : (req.body.contato?.trim() || null);
    if (req.body.anonimo !== undefined) payload.anonimo = Boolean(req.body.anonimo);
    if (req.body.status) payload.status = req.body.status;
    if (req.body.resposta !== undefined) {
      payload.resposta = req.body.resposta?.trim() || null;
      payload.respondedAt = req.body.resposta ? new Date() : null;
      if (!req.body.status && req.body.resposta) payload.status = 'respondida';
    }
    if (req.body.anonimo) {
      payload.nome = null;
      payload.contato = null;
      payload.turma = null;
      payload.turmaId = null;
    }

    await item.update(payload);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const item = await Manifestacao.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Manifestação não encontrada', status: 404 } });
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
