// Uma lista está concluída quando tem itens e nenhum está pendente
export function isListCompleted(list) {
  return list.total_items > 0 && list.pending_items === 0;
}

// Divide as listas em "em andamento" e "concluídas" (omite o grupo vazio)
export function buildListSections(lists) {
  const inProgress = lists.filter((list) => !isListCompleted(list));
  const completed = lists.filter(isListCompleted);
  const sections = [];

  if (inProgress.length > 0) {
    sections.push({ key: 'in-progress', title: 'Listas em andamento', data: inProgress });
  }
  if (completed.length > 0) {
    sections.push({ key: 'completed', title: 'Listas concluídas', data: completed });
  }

  return sections;
}