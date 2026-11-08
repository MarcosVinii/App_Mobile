import { Platform } from 'react-native';

// Ajustes só para a versão web: marca a página como português
// e pede ao navegador que não traduza o texto automaticamente.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.lang = 'pt-BR';

  const meta = document.createElement('meta');
  meta.name = 'google';
  meta.content = 'notranslate';
  document.head.appendChild(meta);
}