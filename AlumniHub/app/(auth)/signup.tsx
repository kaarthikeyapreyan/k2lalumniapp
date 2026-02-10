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
import { Input, Button, CheckBox, useTheme } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { signup, oauthLogin } from '../../store/authSlice';

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword || !graduationYear) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the terms of service');
      return;
    }

    const year = parseInt(graduationYear);
    if (isNaN(year) || year < 1950 || year > new Date().getFullYear() + 10) {
      Alert.alert('Error', 'Please enter a valid graduation year');
      return;
    }

    try {
      await dispatch(
        signup({
          name,
          email,
          password,
          graduationYear: year,
          institution: 'University',
        })
      ).unwrap();
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Signup Failed', error || 'An error occurred');
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'linkedin') => {
    try {
      await dispatch(oauthLogin(provider)).unwrap();
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Signup Failed', error || 'An error occurred');
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
          <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.grey3 }]}>
            Join the alumni community
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.grey3} />}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.black }}
          />

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

          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.grey3} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.grey3}
                />
              </TouchableOpacity>
            }
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.black }}
          />

          <Input
            placeholder="Graduation Year"
            value={graduationYear}
            onChangeText={setGraduationYear}
            keyboardType="number-pad"
            leftIcon={<Ionicons name="school-outline" size={20} color={theme.colors.grey3} />}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.black }}
          />

          <CheckBox
            title="I accept the Terms of Service"
            checked={acceptedTerms}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            containerStyle={[styles.checkboxContainer, { backgroundColor: theme.colors.background }]}
            textStyle={{ color: theme.colors.grey5 }}
          />

          <Button
            title="Sign Up"
            onPress={handleSignup}
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
            title="Sign up with Google"
            onPress={() => handleOAuthSignup('google')}
            loading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />}
            buttonStyle={[styles.oauthButton, { backgroundColor: '#DB4437' }]}
            containerStyle={styles.buttonContainer}
          />

          <Button
            title="Sign up with LinkedIn"
            onPress={() => handleOAuthSignup('linkedin')}
            loading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-linkedin" size={20} color="#fff" style={{ marginRight: 10 }} />}
            buttonStyle={[styles.oauthButton, { backgroundColor: '#0077B5' }]}
            containerStyle={styles.buttonContainer}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: theme.colors.grey5 }]}>
              Already have an account?{' '}
              <Text style={[styles.loginTextBold, { color: theme.colors.primary }]}>Log in</Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
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
  checkboxContainer: {
    borderWidth: 0,
    marginLeft: 0,
    marginBottom: 10,
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
  loginLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: 'bold',
  },
});
