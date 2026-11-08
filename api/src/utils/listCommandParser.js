const { normalizeText } = require('./textNormalizer');

const UNIT_ALIASES = new Map([
  ['un', 'un'], ['und', 'un'], ['unid', 'un'], ['unidade', 'un'], ['unidades', 'un'],
  ['pct', 'pct'], ['pacote', 'pct'], ['pacotes', 'pct'],
  ['cx', 'cx'], ['caixa', 'cx'], ['caixas', 'cx'],
  ['kg', 'kg'], ['kgs', 'kg'], ['quilo', 'kg'], ['quilos', 'kg'], ['kilo', 'kg'], ['kilos', 'kg'],
  ['g', 'g'], ['gr', 'g'], ['grama', 'g'], ['gramas', 'g'],
  ['l', 'l'], ['lt', 'l'], ['litro', 'l'], ['litros', 'l'],
  ['ml', 'ml'], ['mililitro', 'ml'], ['mililitros', 'ml'],
]);

const DIVIDER_REGEX = /^-{3,}$/;
const AMOUNT_REGEX = /^(\d+(?:[.,]\d+)?)\s*([^\d\s]*)$/;

function lookupUnit(text) {
  return UNIT_ALIASES.get(normalizeText(text)) || null;
}

// Interpreta o texto de um item: "Arroz #2 kg", "Leite #3 L" ou só "Arroz"
function parseItemText(text) {
  const hashIndex = text.lastIndexOf('#');
  const name = (hashIndex === -1 ? text : text.slice(0, hashIndex)).trim();

  if (!name) {
    throw new Error('Informe o nome do item.');
  }

  if (hashIndex === -1) {
    return { name, quantity: 1, unit: 'un' };
  }

  const match = text.slice(hashIndex + 1).trim().match(AMOUNT_REGEX);

  if (!match) {
    throw new Error('Use o formato "Nome #quantidade unidade", por exemplo "Arroz #2 kg".');
  }

  const quantity = Number(match[1].replace(',', '.'));
  const unit = match[2] ? lookupUnit(match[2]) : 'un';

  if (!unit) {
    throw new Error(`Unidade desconhecida: "${match[2]}".`);
  }

  return { name, quantity, unit };
}

// Converte o texto em entradas (item, section, divider) e erros por linha
function parseListCommands(text) {
  const entries = [];
  const errors = [];

  String(text)
    .split(/\r?\n/)
    .forEach((rawLine, index) => {
      const line = rawLine.trim();
      const lineNumber = index + 1;

      if (!line) return;

      try {
        if (DIVIDER_REGEX.test(line)) {
          entries.push({ type: 'divider', line: lineNumber, text: line });
          return;
        }

        if (line.startsWith('#')) {
          const title = line.replace(/^#+\s*/, '').trim();

          if (!title) {
            throw new Error('Informe o título da seção depois do "#".');
          }

          entries.push({ type: 'section', title, line: lineNumber, text: line });
          return;
        }

        const itemText = line.startsWith('-') ? line.slice(1).trim() : line;
        entries.push({
          type: 'item',
          ...parseItemText(itemText),
          line: lineNumber,
          text: line,
        });
      } catch (error) {
        errors.push({ line: lineNumber, text: line, message: error.message });
      }
    });

  return { entries, errors };
}

module.exports = { parseListCommands };