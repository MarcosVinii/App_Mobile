import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { ROOM_ICONS } from '../utils/roomIcons';

export default function RoomIconPicker({ value, onChange }) {
  return (
    <View style={styles.grid}>
      {ROOM_ICONS.map((icon, index) => {
        const isSelected = icon === value;

        return (
          <IconButton
            key={icon}
            icon={icon}
            size={28}
            mode={isSelected ? 'contained' : 'outlined'}
            selected={isSelected}
            onPress={() => onChange(icon)}
            accessibilityLabel={`Escolher ícone ${index + 1}`}
            accessibilityState={{ selected: isSelected }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});