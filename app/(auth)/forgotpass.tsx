import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import React, { useState } from "react";
  import { Colors } from '../../constants/Colors'
  import { Ionicons } from "@expo/vector-icons";
  import { useNavigation } from "@react-navigation/native";

  
  

const Forgotpass = () => {
    const navigation = useNavigation();

    const [secureEntery, setSecureEntery] = useState(true);
  
    const handleGoBack = () => {
      navigation.goBack();
    };
    const handleForgot = () => {
      navigation.goBack();
    };
    
  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={handleGoBack}>
          <Ionicons
            name={"arrow-back-outline"}
            color={Colors.primary}
            size={25}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.headingText}>Reset your </Text>
          <Text style={styles.headingText}>Password</Text>
        </View>
        {/* form  */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name={"mail-outline"} size={30} color={Colors.secondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor={Colors.secondary}
              keyboardType="email-address"
            />
          </View>
          </View>
          <TouchableOpacity onPress={handleForgot} style={styles.loginButtonWrapper}>
            <Text style={styles.loginText}>Send Reset Link</Text>
          </TouchableOpacity>
          </View>
  )
}

export default Forgotpass

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      padding: 25,
    },
    backButtonWrapper: {
      height: 40,
      width: 40,
      backgroundColor: Colors.gray,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    textContainer: {
      marginVertical: 20,
    },
    headingText: {
      fontSize: 32,
      color: Colors.primary,
      fontFamily: 'outfit-bold',
    },
    formContainer: {
      marginTop: 20,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: Colors.secondary,
      borderRadius: 100,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      padding: 7,
      marginVertical: 10,
    },
    textInput: {
      flex: 1,
      paddingHorizontal: 10,
      fontFamily: 'outfit',
    },
    forgotPasswordText: {
      textAlign: "right",
      color: Colors.primary,
      fontFamily: 'outfit',
      marginVertical: 10,
    },
    loginButtonWrapper: {
      backgroundColor: Colors.PRIMARY,
      borderRadius: 100,
      marginTop: 20,
    },
    loginText: {
      color: Colors.white,
      fontSize: 20,
      fontFamily: 'outfit',
      textAlign: "center",
      padding: 10,
    },
    continueText: {
      textAlign: "center",
      marginVertical: 20,
      fontSize: 14,
      fontFamily: 'outfit',
      color: Colors.primary,
    },
    googleButtonContainer: {
      flexDirection: "row",
      borderWidth: 2,
      borderColor: Colors.primary,
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
      gap: 10,
    },
    googleImage: {
      height: 20,
      width: 20,
    },
    googleText: {
      fontSize: 20,
      fontFamily: 'outfit',
    },
    footerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
      gap: 5,
    },
    accountText: {
      color: Colors.primary,
      fontFamily: 'outfit',
    },
    signupText: {
      color: Colors.primary,
      fontFamily: 'outfit',
    },
  });