import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { auth } from '@/firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';
import CountryPicker, { CountryCode, Country } from 'react-native-country-picker-modal';
import { useRouter } from 'expo-router';

const OTPLogin: React.FC = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2 as CountryCode);
    setCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);
  };

  const validatePhoneNumber = () => {
    const phoneNumberPattern = /^\d{10}$/;
    return phoneNumberPattern.test(phoneNumber);
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

      // Send OTP through Firebase
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber);

      // Navigate to OTP verification screen with the confirmation
      router.push({
        pathname: '/(auth)/OTPVerification',
        params: { verificationId: confirmation.verificationId, phoneNumber: fullPhoneNumber },
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Phone Number</Text>
      <Text style={styles.subtitle}>
        We'll send you a one-time verification code
      </Text>

      <View style={styles.phoneInputContainer}>
        <TouchableOpacity
          style={styles.countryPickerButton}
          onPress={() => setShowCountryPicker(true)}
        >
          <CountryPicker
            withFilter
            withCallingCode
            withFlagButton
            withCallingCodeButton
            withModal
            visible={showCountryPicker}
            onClose={() => setShowCountryPicker(false)}
            onSelect={onSelectCountry}
            countryCode={countryCode}
            containerButtonStyle={styles.countryPickerButtonContent}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.phoneInput}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={10}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendOTPButton, loading && styles.disabledButton]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendOTPButtonText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    marginBottom: 30,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryPickerButton: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  countryPickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'outfit',
  },
  sendOTPButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  sendOTPButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  termsText: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.GRAY,
    fontFamily: 'outfit',
    fontSize: 12,
  },
});

export default OTPLogin;
