import { Op } from 'sequelize';
import { Manifestacao, TIPOS, SETORES, STATUS } from '../models/Manifestacao.js';
import { sendManifestacaoEmail } from '../services/email.service.js';
import { validarCampos } from '../services/profanity.service.js';

function normalizarTurma(v) {
  return String(v || '').trim().slice(0, 10);
}

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
  if (data.turma !== undefined && data.turma !== null && data.turma !== '' && !data.anonimo) {
    if (String(data.turma).trim().length > 10) {
      errors.push('turma deve ter no máximo 10 caracteres');
    }
  }
  return errors;
}

const PROTOCOLO_ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function gerarParteAleatoria(tamanho = 8) {
  let out = '';
  for (let i = 0; i < tamanho; i++) {
    out += PROTOCOLO_ALFABETO.charAt(Math.floor(Math.random() * PROTOCOLO_ALFABETO.length));
  }
  return out;
}

function buildProtocolo() {
  const year = new Date().getFullYear();
  return `NRC-${year}-${gerarParteAleatoria(8)}`;
}

async function gerarProtocoloUnico() {
  for (let i = 0; i < 10; i++) {
    const p = buildProtocolo();
    const exists = await Manifestacao.findOne({ where: { protocolo: p } });
    if (!exists) return p;
  }
  throw new Error('Não foi possível gerar protocolo único');
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
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const { rows, count } = await Manifestacao.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, limit, offset });
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
    const item = await Manifestacao.findOne({
      where: { protocolo: req.params.protocolo },
    });
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

    const camposRuins = validarCampos(req.body);
    if (camposRuins.length) {
      return res.status(400).json({ error: { message: `Conteúdo inapropriado detectado no campo: ${camposRuins.join(', ')}`, status: 400 } });
    }

    const protocolo = await gerarProtocoloUnico();

    const item = await Manifestacao.create({
      protocolo,
      tipo: req.body.tipo,
      titulo: req.body.titulo.trim(),
      descricao: req.body.descricao.trim(),
      setor: req.body.setor || null,
      turma: req.body.anonimo ? null : (normalizarTurma(req.body.turma) || null),
      nome: req.body.anonimo ? null : (req.body.nome?.trim() || null),
      contato: req.body.anonimo ? null : (req.body.contato?.trim() || null),
      anonimo: Boolean(req.body.anonimo),
      status: 'aberta',
    });
    setImmediate(() => {
      sendManifestacaoEmail(item).catch(() => {});
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

    const camposRuins = validarCampos(req.body);
    if (camposRuins.length) {
      return res.status(400).json({ error: { message: `Conteúdo inapropriado detectado no campo: ${camposRuins.join(', ')}`, status: 400 } });
    }

    const payload = {};
    if (req.body.tipo) payload.tipo = req.body.tipo;
    if (req.body.titulo) payload.titulo = req.body.titulo.trim();
    if (req.body.descricao) payload.descricao = req.body.descricao.trim();
    if (req.body.setor !== undefined) payload.setor = req.body.setor || null;
    if (req.body.turma !== undefined) {
      if (req.body.anonimo) {
        payload.turma = null;
      } else if (req.body.turma) {
        if (String(req.body.turma).trim().length > 10) {
          return res.status(400).json({ error: { message: 'turma deve ter no máximo 10 caracteres', status: 400 } });
        }
        payload.turma = normalizarTurma(req.body.turma);
      } else {
        payload.turma = null;
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
