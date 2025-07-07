import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LoginWithOAuthInput, useLoginWithOAuth } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
import { useLoginWithPasskey } from '@privy-io/expo/passkey';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { Button } from '@/shared/components/ui/button';

type OAuthProvider = 'github' | 'google' | 'discord' | 'apple';

export const LoginScreen = () => {
  const [error, setError] = useState<string>('');
  
  const { loginWithPasskey } = useLoginWithPasskey({
    onError: (err) => {
      console.error('Passkey login error:', err);
      setError(err.message || 'Passkey login failed');
    },
  });
  
  const { login } = useLogin();
  
  const oauth = useLoginWithOAuth({
    onError: (err) => {
      console.error('OAuth login error:', err);
      setError(err.message || 'OAuth login failed');
    },
  });

  const handlePrivyLogin = useCallback(async () => {
    try {
      const session = await login({ loginMethods: ['email'] });
      console.log('User logged in', session.user);
    } catch (err: any) {
      setError(err.error || 'Login failed');
    }
  }, [login]);

  const handlePasskeyLogin = useCallback(() => {
    loginWithPasskey({
      relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
    });
  }, [loginWithPasskey]);

  const handleOAuthLogin = useCallback((provider: OAuthProvider) => {
    oauth.login({ provider } as LoginWithOAuthInput);
  }, [oauth]);

  const openDashboard = useCallback(() => {
    const dashboardUrl = `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`;
    Linking.openURL(dashboardUrl);
  }, []);

  const oauthProviders: OAuthProvider[] = ['github', 'google', 'discord', 'apple'];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6 py-8">
        {/* Configuration Info Section */}
        <View className="w-full mb-8 p-4 bg-muted rounded-lg">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Configuration Info
          </Text>
          
          <View className="mb-3">
            <Text className="text-xs text-muted-foreground">Privy App ID:</Text>
            <Text className="text-xs font-mono text-foreground">
              {Constants.expoConfig?.extra?.privyAppId}
            </Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-xs text-muted-foreground">Privy Client ID:</Text>
            <Text className="text-xs font-mono text-foreground">
              {Constants.expoConfig?.extra?.privyClientId}
            </Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-xs text-muted-foreground mb-1">
              Navigate to your{' '}
              <Text 
                className="text-primary underline"
                onPress={openDashboard}
              >
                dashboard
              </Text>
              {' '}and ensure the following Expo Application ID is listed as an "Allowed app identifier":
            </Text>
            <Text className="text-xs font-mono text-foreground">
              {Application.applicationId}
            </Text>
          </View>
          
          <View>
            <Text className="text-xs text-muted-foreground mb-1">
              Also ensure the following value is listed as an "Allowed app URL scheme":
            </Text>
            <Text className="text-xs font-mono text-foreground">
              {Application.applicationId === 'host.exp.Exponent'
                ? 'exp'
                : Constants.expoConfig?.scheme}
            </Text>
          </View>
        </View>

        {/* Login Options */}
        <View className="w-full space-y-3">
          <Button
            onPress={handlePrivyLogin}
            className="w-full"
          >
            <Text className="text-white font-medium">Login with Privy UIs</Text>
          </Button>

          <Button
            onPress={handlePasskeyLogin}
            variant="secondary"
            className="w-full"
          >
            <Text className="text-white font-medium">Login using Passkey</Text>
          </Button>

          {/* OAuth Providers */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-foreground mb-3 text-center">
              Or continue with
            </Text>
            <View className="space-y-2">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider}
                  onPress={() => handleOAuthLogin(provider)}
                  variant="outline"
                  disabled={oauth.state.status === 'loading'}
                  className="w-full"
                >
                  <Text className="text-foreground font-medium capitalize">
                    Login with {provider}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View className="w-full mt-4 p-3 bg-destructive/10 rounded-lg">
            <Text className="text-sm text-destructive">
              Error: {error}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};