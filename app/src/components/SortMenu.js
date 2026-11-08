import { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

// Botão que mostra a opção atual e abre um menu com as demais.
// options: [{ value, label, icon? }]
export default function SortMenu({ options, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const current = options.find((option) => option.value === value) || options[0];

  function handleSelect(optionValue) {
    onChange(optionValue);
    setVisible(false);
  }

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      anchor={
        <Button
          mode="outlined"
          icon="sort"
          onPress={() => setVisible(true)}
          accessibilityLabel={`Ordenar produtos. Opção atual: ${current.label}`}
        >
          {`Ordenar: ${current.label}`}
        </Button>
      }
    >
      {options.map((option) => (
        <Menu.Item
          key={String(option.value)}
          title={option.label}
          leadingIcon={option.icon}
          trailingIcon={option.value === value ? 'check' : undefined}
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </Menu>
  );
}