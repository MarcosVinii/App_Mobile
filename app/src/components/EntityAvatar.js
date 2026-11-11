import { Avatar } from 'react-native-paper';

// Mostra a foto, se existir; senão, o ícone padrão
export default function EntityAvatar({ image, icon, size = 40, style }) {
  if (image) {
    return <Avatar.Image size={size} source={{ uri: image }} style={style} />;
  }

  return <Avatar.Icon size={size} icon={icon} style={style} />;
}