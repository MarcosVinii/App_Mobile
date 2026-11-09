const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 60;

export function validateListForm({ title }) {
  const length = title.trim().length;
  const isValid = length >= MIN_TITLE_LENGTH && length <= MAX_TITLE_LENGTH;

  return isValid
    ? {}
    : { title: `O título deve ter entre ${MIN_TITLE_LENGTH} e ${MAX_TITLE_LENGTH} caracteres.` };
}