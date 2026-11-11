import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, HelperText, Snackbar, TextInput } from 'react-native-paper';

import AuthLayout from '../components/AuthLayout';
import useAuth from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validators';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecoveryNotice, setShowRecoveryNotice] = useState(false);

  async function handleLogin() {
    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthLayout title="Domus" subtitle="Entre para organizar sua casa.">
        <TextInput
          label="E-mail"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={Boolean(errors.email)}
        />
        <HelperText type="error" visible={Boolean(errors.email)}>
          {errors.email}
        </HelperText>

        <TextInput
          label="Senha"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          error={Boolean(errors.password)}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((current) => !current)}
            />
          }
        />
        <HelperText type="error" visible={Boolean(errors.password)}>
          {errors.password}
        </HelperText>

        <HelperText type="error" visible={Boolean(submitError)}>
          {submitError}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.button}
        >
          Entrar
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Register')}>
          Criar conta
        </Button>
        <Button mode="text" onPress={() => setShowRecoveryNotice(true)}>
          Esqueci minha senha
        </Button>
      </AuthLayout>

      <Snackbar
        visible={showRecoveryNotice}
        onDismiss={() => setShowRecoveryNotice(false)}
        duration={4000}
      >
        A recuperação de senha será adicionada em breve.
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});