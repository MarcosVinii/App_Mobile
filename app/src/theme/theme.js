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

// Cores de situação do estoque (sempre acompanhadas de ícone ou texto)
export const statusColors = {
  outOfStock: '#C0392B',
  lowStock: '#D4A017',
  normal: '#3E8E5A',
  secondary: '#8A8A8A',
};

export default theme;