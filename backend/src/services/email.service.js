import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

export async function sendManifestacaoEmail(manifestacao) {
  const to = env.setorEmails?.[manifestacao.setor];
  if (!to) {
    console.log(`[email] nenhum destinatário configurado para o setor ${manifestacao.setor}`);
    return false;
  }
  const t = getTransporter();
  if (!t) {
    console.log(`[email] SMTP não configurado; e-mail para ${to} não enviado`);
    return false;
  }
  const responsavel = env.setorResponsaveis?.[manifestacao.setor] || manifestacao.setor;
  const subject = `[Ouvidoria NARCEU] Nova manifestação: ${manifestacao.titulo}`;
  const text = [
    `Nova manifestação recebida pela ouvidoria.`,
    ``,
    `Protocolo: ${manifestacao.protocolo}`,
    `Tipo: ${manifestacao.tipo}`,
    `Setor: ${manifestacao.setor} (${responsavel})`,
    `Anônimo: ${manifestacao.anonimo ? 'Sim' : 'Não'}`,
    manifestacao.nome ? `Nome: ${manifestacao.nome}` : '',
    manifestacao.turma ? `Turma: ${manifestacao.turma}` : '',
    `Título: ${manifestacao.titulo}`,
    `Descrição: ${manifestacao.descricao}`,
    ``,
    `Criado em: ${manifestacao.createdAt}`,
  ].filter(Boolean).join('\n');

  try {
    await t.sendMail({
      from: env.smtp.from || env.smtp.user,
      to,
      subject,
      text,
    });
    console.log(`[email] enviado para ${to} (protocolo ${manifestacao.protocolo})`);
    return true;
  } catch (err) {
    console.error('[email] falha ao enviar:', err.message);
    return false;
  }
}