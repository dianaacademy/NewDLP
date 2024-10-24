import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image   } from 'react-native';
import { Link } from 'expo-router';
import tw from 'twrnc';
const LoginScreen = () => {
  return (
    <View style={tw`flex-1 justify-center px-8 bg-white`}>
      <Text style={tw`text-3xl font-bold mb-4`}>Sign in</Text>

      {/* Email Input */}
      <TextInput
        placeholder="you@example.com"
        style={tw`border p-4 mb-4 border-gray-300 rounded-lg`}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={tw`border p-4 mb-4 border-gray-300 rounded-lg`}
      />

      {/* Remember Me and Forgot Password */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-row items-center`}>
          {/* <CheckBox value={false} /> */}
          <Text style={tw`ml-2`}>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={tw`text-blue-500`}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={tw`bg-green-500 p-4 rounded-lg mb-4`}>
        <Text style={tw`text-white text-center font-bold`}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity style={tw`border p-4 rounded-lg border-gray-300`}>

      <Link href="/signin">sign up</Link> 
        {/*

        <Text style={tw`text-center font-bold`}>Sign Up</Text> */}
     
      </TouchableOpacity>

      {/* Social Media Login */}
      <Text style={tw`text-center mt-8 mb-4`}>or continue with</Text>
      <View style={tw`flex-row justify-center`}>
        <TouchableOpacity style={tw`mr-4`}>
          <Image
            source={{ uri: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }}
            // style={tw`w-10 h-10`}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png' }}
            // style={tw`w-10 h-10`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
