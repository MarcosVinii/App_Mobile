import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import AuthLayout from '../components/AuthLayout';
import useAuth from '../hooks/useAuth';
import { validateRegisterForm } from '../utils/validators';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const validationErrors = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
    });
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Preencha os dados para começar.">
      <TextInput
        label="Nome"
        mode="outlined"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        error={Boolean(errors.name)}
      />
      <HelperText type="error" visible={Boolean(errors.name)}>
        {errors.name}
      </HelperText>

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

      <TextInput
        label="Confirmar senha"
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        error={Boolean(errors.confirmPassword)}
      />
      <HelperText type="error" visible={Boolean(errors.confirmPassword)}>
        {errors.confirmPassword}
      </HelperText>

      <HelperText type="error" visible={Boolean(submitError)}>
        {submitError}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.button}
      >
        Cadastrar
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')}>
        Já tenho conta
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});