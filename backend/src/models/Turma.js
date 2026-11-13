import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TURNOS = ['diurno', 'noturno'];

export const Turma = sequelize.define(
  'Turma',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    turno: { type: DataTypes.ENUM(...TURNOS), allowNull: false, defaultValue: 'diurno' },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: 'turmas',
    timestamps: true,
  },
);
