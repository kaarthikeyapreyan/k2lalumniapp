import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button, useTheme } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { login, oauthLogin, clearError } from '../../store/authSlice';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Failed', error || 'An error occurred');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'linkedin') => {
    try {
      await dispatch(oauthLogin(provider)).unwrap();
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Failed', error || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>AlumniHub</Text>
          <Text style={[styles.subtitle, { color: theme.colors.grey3 }]}>
            Connect with fellow alumni
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.grey3} />}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.black }}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.grey3} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.grey3}
                />
              </TouchableOpacity>
            }
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.black }}
          />

          <TouchableOpacity>
            <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
            containerStyle={styles.buttonContainer}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.grey2 }]} />
            <Text style={[styles.dividerText, { color: theme.colors.grey3 }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.grey2 }]} />
          </View>

          <Button
            title="Sign in with Google"
            onPress={() => handleOAuthLogin('google')}
            loading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />}
            buttonStyle={[styles.oauthButton, { backgroundColor: '#DB4437' }]}
            containerStyle={styles.buttonContainer}
          />

          <Button
            title="Sign in with LinkedIn"
            onPress={() => handleOAuthLogin('linkedin')}
            loading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-linkedin" size={20} color="#fff" style={{ marginRight: 10 }} />}
            buttonStyle={[styles.oauthButton, { backgroundColor: '#0077B5' }]}
            containerStyle={styles.buttonContainer}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={styles.signupLink}
          >
            <Text style={[styles.signupText, { color: theme.colors.grey5 }]}>
              Don't have an account?{' '}
              <Text style={[styles.signupTextBold, { color: theme.colors.primary }]}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 10,
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  oauthButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: 'bold',
  },
});
