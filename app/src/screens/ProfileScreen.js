import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  List,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import useAuth from '../hooks/useAuth';
import usePreferences from '../hooks/usePreferences';
import useToast from '../hooks/useToast';
import * as authService from '../services/authService';
import {
  areNotificationsSupported,
  requestNotificationPermission,
  resetNotifiedAlerts,
} from '../services/notificationService';
import { validatePasswordForm, validateProfileForm } from '../utils/profileValidators';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, updateUser, signOut } = useAuth();
  const { stockNotifications, setStockNotifications } = usePreferences();
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileChanged =
    name.trim() !== user.name || email.trim().toLowerCase() !== user.email;
  const notificationsSupported = areNotificationsSupported();

  async function handleSaveProfile() {
    const errors = validateProfileForm({ name, email });
    setProfileErrors(errors);
    setProfileError('');

    if (Object.keys(errors).length > 0) return;

    setIsSavingProfile(true);
    try {
      const updated = await authService.updateProfile(name.trim(), email.trim());

      updateUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      showToast('Dados atualizados com sucesso.', { type: 'success' });
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    const errors = validatePasswordForm({ currentPassword, newPassword, confirmPassword });
    setPasswordErrors(errors);
    setPasswordError('');

    if (Object.keys(errors).length > 0) return;

    setIsSavingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha alterada com sucesso.', { type: 'success' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleToggleNotifications(enabled) {
    if (!enabled) {
      setStockNotifications(false);
      await resetNotifiedAlerts();
      showToast('Alertas de estoque desligados.', { type: 'info' });
      return;
    }

    const granted = await requestNotificationPermission();

    if (!granted) {
      showToast('Permissão negada. Ative as notificações nas configurações do aparelho.', {
        type: 'error',
      });
      return;
    }

    setStockNotifications(true);
    showToast('Alertas de estoque ligados. Você será avisado ao abrir o app.', {
      type: 'success',
    });
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.body}>
        <Card style={styles.card}>
          <Card.Title title="Dados da conta" titleVariant="titleMedium" />
          <Card.Content>
            <TextInput
              label="Nome"
              mode="outlined"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={Boolean(profileErrors.name)}
            />
            <HelperText type="error" visible={Boolean(profileErrors.name)}>
              {profileErrors.name}
            </HelperText>

            <TextInput
              label="E-mail"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={Boolean(profileErrors.email)}
            />
            <HelperText type="error" visible={Boolean(profileErrors.email)}>
              {profileErrors.email}
            </HelperText>

            <HelperText type="error" visible={Boolean(profileError)}>
              {profileError}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSaveProfile}
              loading={isSavingProfile}
              disabled={isSavingProfile || !profileChanged}
            >
              Salvar dados
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Alterar senha" titleVariant="titleMedium" />
          <Card.Content>
            <TextInput
              label="Senha atual"
              mode="outlined"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              error={Boolean(passwordErrors.currentPassword)}
              right={
                <TextInput.Icon
                  icon={showPasswords ? 'eye-off' : 'eye'}
                  onPress={() => setShowPasswords((current) => !current)}
                />
              }
            />
            <HelperText type="error" visible={Boolean(passwordErrors.currentPassword)}>
              {passwordErrors.currentPassword}
            </HelperText>

            <TextInput
              label="Nova senha"
              mode="outlined"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              error={Boolean(passwordErrors.newPassword)}
            />
            <HelperText type="error" visible={Boolean(passwordErrors.newPassword)}>
              {passwordErrors.newPassword}
            </HelperText>

            <TextInput
              label="Confirmar nova senha"
              mode="outlined"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              error={Boolean(passwordErrors.confirmPassword)}
            />
            <HelperText type="error" visible={Boolean(passwordErrors.confirmPassword)}>
              {passwordErrors.confirmPassword}
            </HelperText>

            <HelperText type="error" visible={Boolean(passwordError)}>
              {passwordError}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={isSavingPassword}
              disabled={isSavingPassword}
            >
              Alterar senha
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <List.Item
            title="Alertas de estoque"
            description={
              notificationsSupported
                ? 'Aviso quando um produto ficar com estoque baixo ou zerado.'
                : 'Disponível apenas no aplicativo do celular.'
            }
            descriptionNumberOfLines={3}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={stockNotifications}
                onValueChange={handleToggleNotifications}
                disabled={!notificationsSupported}
                accessibilityLabel="Alertas de estoque"
              />
            )}
          />
        </Card>

        <Text variant="bodySmall" style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          Conectado como {user.email}
        </Text>

        <Button mode="outlined" icon="logout" onPress={signOut}>
          Sair da conta
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 48,
  },
  body: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    marginBottom: 12,
  },
});