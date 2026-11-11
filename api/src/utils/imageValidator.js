const AppError = require('./AppError');

const IMAGE_REGEX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const MAX_IMAGE_LENGTH = 150000;

// undefined = não enviada (mantém a atual); null = remover; texto = nova imagem
function parseImage(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const isValid =
    typeof value === 'string' && value.length <= MAX_IMAGE_LENGTH && IMAGE_REGEX.test(value);

  if (!isValid) {
    throw new AppError('Imagem inválida ou grande demais. Escolha outra foto.', 400);
  }

  return value;
}

module.exports = { parseImage };