import { Manifestacao } from './Manifestacao.js';
import { Turma } from './Turma.js';

Manifestacao.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turmaRef' });
Turma.hasMany(Manifestacao, { foreignKey: 'turmaId', as: 'manifestacoes' });

export { Manifestacao, Turma };
export * from './Manifestacao.js';
export * from './Turma.js';
