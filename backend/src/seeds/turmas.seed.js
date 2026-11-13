import { env } from '../config/env.js';

export const turmasSeedPadrao = [
  { nome: '1º A', turno: 'diurno' },
  { nome: '1º B', turno: 'diurno' },
  { nome: '2º A', turno: 'diurno' },
  { nome: '2º B', turno: 'diurno' },
  { nome: '3º A', turno: 'diurno' },
  { nome: '3º B', turno: 'diurno' },
  { nome: '1º A', turno: 'noturno' },
  { nome: '1º B', turno: 'noturno' },
  { nome: '2º A', turno: 'noturno' },
  { nome: '2º B', turno: 'noturno' },
  { nome: '3º A', turno: 'noturno' },
  { nome: '3º B', turno: 'noturno' },
];

export async function seedTurmas(Turma) {
  const count = await Turma.count();
  if (count > 0) return;

  const fromEnv = env.turmasSeed || [];
  const data = fromEnv.length ? fromEnv : turmasSeedPadrao;

  await Turma.bulkCreate(data, { ignoreDuplicates: true });
}
