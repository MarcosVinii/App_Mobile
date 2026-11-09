import { IconButton } from 'react-native-paper';

import usePreferences from '../hooks/usePreferences';
import useToast from '../hooks/useToast';

// Botão de lâmpada: liga e desliga a organização inteligente do estoque
export default function SmartOrganizationButton() {
  const { smartOrganization, setSmartOrganization } = usePreferences();
  const { showToast } = useToast();

  function handlePress() {
    const next = !smartOrganization;
    setSmartOrganization(next);

    showToast(
      next
        ? 'Organização inteligente ligada: o estoque é atualizado ao marcar compras.'
        : 'Organização inteligente desligada: as compras vão para o Armazém.',
      { type: 'info' }
    );
  }

  return (
    <IconButton
      icon={smartOrganization ? 'lightbulb-on' : 'lightbulb-off-outline'}
      mode={smartOrganization ? 'contained' : 'outlined'}
      size={22}
      onPress={handlePress}
      accessibilityLabel={`Organização inteligente: ${
        smartOrganization ? 'ligada' : 'desligada'
      }. Toque para ${smartOrganization ? 'desligar' : 'ligar'}.`}
      accessibilityState={{ selected: smartOrganization }}
    />
  );
}