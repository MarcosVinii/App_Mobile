const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 60;
const MAX_NOTES_LENGTH = 2000;

// Título e observações são opcionais; só validamos o que foi preenchido
export function validateListForm({ title, notes }) {
  const errors = {};
  const titleLength = title.trim().length;

  if (titleLength > 0 && (titleLength < MIN_TITLE_LENGTH || titleLength > MAX_TITLE_LENGTH)) {
    errors.title = `O título deve ter entre ${MIN_TITLE_LENGTH} e ${MAX_TITLE_LENGTH} caracteres.`;
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `As observações podem ter no máximo ${MAX_NOTES_LENGTH} caracteres.`;
  }

  return errors;
}