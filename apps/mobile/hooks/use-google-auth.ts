import { AuthResponse } from '@cro/shared';
import Constants from 'expo-constants';
// import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import { apiClient } from '@/api/client';
import { setTokens } from '@/api/token-storage';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/auth.slice';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
// Expo auth proxy redirect — add this URI to Google Console authorized redirect URIs
const REDIRECT_URI = `https://auth.expo.io/@${Constants.expoConfig?.owner ?? 'anonymous'}/croatian-grammar`;
// App custom scheme — WebBrowser listens for this to close the browser
// const APP_SCHEME = Linking.createURL('');

function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();

  const promptAsync = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) return;
    const result = await WebBrowser.openAuthSessionAsync(buildGoogleAuthUrl(), REDIRECT_URI);
    if (result.type !== 'success') return;

    // Extract authorization code from redirect URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) return;

    const { data } = await apiClient.post<AuthResponse>('/auth/google/token', {
      code,
      redirectUri: REDIRECT_URI,
    });
    await setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    dispatch(setUser(data.user));
  }, [dispatch]);

  return { promptAsync, isReady: !!GOOGLE_CLIENT_ID };
}
