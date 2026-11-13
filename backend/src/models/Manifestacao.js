import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TIPOS = ['denuncia', 'reclamacao', 'sugestao', 'elogio', 'solicitacao'];
export const SETORES = ['direcao', 'pedagogico', 'secretaria', 'apoie', 'tutor'];
export const STATUS = ['aberta', 'em_analise', 'respondida', 'concluida', 'arquivada'];

export const Manifestacao = sequelize.define(
  'Manifestacao',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    protocolo: { type: DataTypes.STRING(32), allowNull: true, unique: true },
    tipo: { type: DataTypes.ENUM(...TIPOS), allowNull: false },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    setor: { type: DataTypes.ENUM(...SETORES), allowNull: true },
    turma: { type: DataTypes.STRING(50), allowNull: true },
    turmaId: { type: DataTypes.INTEGER, allowNull: true },
    nome: { type: DataTypes.STRING(120), allowNull: true },
    contato: { type: DataTypes.STRING(120), allowNull: true },
    anonimo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: { type: DataTypes.ENUM(...STATUS), allowNull: false, defaultValue: 'aberta' },
    resposta: { type: DataTypes.TEXT, allowNull: true },
    respondedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'manifestacoes',
    timestamps: true,
  },
);
