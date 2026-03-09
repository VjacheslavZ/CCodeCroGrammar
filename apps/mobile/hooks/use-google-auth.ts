import { AuthResponse } from '@cro/shared';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';

import { apiClient } from '@/api/client';
import { setTokens } from '@/api/token-storage';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/auth.slice';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const REDIRECT_URI = Linking.createURL('auth/callback');

// Build Google OAuth URL manually to avoid expo-auth-session (requires native build)
function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: Math.random().toString(36).substring(2),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();

  const handleIdToken = useCallback(
    async (idToken: string) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/google/token', { idToken });
      await setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      dispatch(setUser(data.user));
    },
    [dispatch],
  );

  // Listen for deep link redirect with id_token fragment
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const hash = url.split('#')[1];
      if (!hash) return;
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      if (idToken) {
        handleIdToken(idToken);
      }
    });
    return () => subscription.remove();
  }, [handleIdToken]);

  const promptAsync = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) return;
    await WebBrowser.openAuthSessionAsync(buildGoogleAuthUrl(), REDIRECT_URI);
  }, []);

  return { promptAsync, isReady: !!GOOGLE_CLIENT_ID };
}
