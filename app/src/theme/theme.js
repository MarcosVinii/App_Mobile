import { MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5B7C6F',
    background: '#F6F5F2',
    surface: '#FFFFFF',
  },
};

// Cores de situação do estoque (sempre acompanhadas de ícone ou texto).
// Tons escolhidos para manter bom contraste sobre fundo claro.
export const statusColors = {
  outOfStock: '#C0392B',
  lowStock: '#8F5E00',
  normal: '#2E7D4F',
  secondary: '#8A8A8A',
};

export default theme;