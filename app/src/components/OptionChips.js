import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

// Grupo de chips para escolher uma opção. options: [{ value, label, icon? }]
export default function OptionChips({ options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Chip
            key={String(option.value)}
            icon={option.icon}
            selected={isSelected}
            onPress={() => onChange(option.value)}
            accessibilityState={{ selected: isSelected }}
          >
            {option.label}
          </Chip>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});