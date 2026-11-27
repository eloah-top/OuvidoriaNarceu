import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analisar } from 'profanity-br';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LISTA_PATH = path.join(__dirname, '..', 'data', 'palavras.txt');

const LIMITES = { vulgaridadeMax: 2, alvoSeveridadeMax: 1 };

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Termos forçados (sempre considerados pesados, independente da classificação)
const TERMOS_FORCADOS = new Set(['cu', 'cuzao', 'cuzão', 'buceta', 'caralho', 'foda', 'puta', 'pica', 'viado', 'traveco', 'arrombado', 'fdp']);

// Carrega e filtra apenas termos "pesados" (vulgaridade >= 3 ou alvo >= 2)
const termosPesados = new Set(TERMOS_FORCADOS);
try {
  const raw = fs.readFileSync(LISTA_PATH, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const termo = line.trim();
    if (!termo || termo.startsWith('#')) continue;
    const n = normalizar(termo);
    if (TERMOS_FORCADOS.has(n)) {
      termosPesados.add(n);
      continue;
    }
    try {
      const a = analisar(termo, { limites: LIMITES });
      // pesado se excederia os limites (vulgaridade forte ou alvo severo)
      if (a.excedeuLimites) {
        termosPesados.add(n);
      }
    } catch (e) {}
  }
} catch (e) {
  console.error('[profanity] falha ao carregar word list:', e.message);
}

function contemPalavrao(texto) {
  if (!texto) return false;
  const n = normalizar(texto);
  if (!n) return false;
  // 1) evasão via profanity-br
  try {
    const a = analisar(String(texto), { limites: LIMITES });
    if (a.excedeuLimites) return true;
  } catch (e) {}
  // 2) termos pesados da word list
  for (const termo of termosPesados) {
    if (!termo) continue;
    if (termo.includes(' ')) {
      if (n.includes(termo)) return true;
    } else {
      const re = new RegExp('\\b' + termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (re.test(n)) return true;
    }
  }
  return false;
}

const CAMPOS_TEXTO = ['titulo', 'descricao', 'nome', 'resposta', 'contato'];

function validarCampos(obj) {
  const erros = [];
  for (const campo of CAMPOS_TEXTO) {
    if (obj && obj[campo] && contemPalavrao(obj[campo])) {
      erros.push(campo);
    }
  }
  return erros;
}

export { contemPalavrao, validarCampos, CAMPOS_TEXTO, termosPesados };