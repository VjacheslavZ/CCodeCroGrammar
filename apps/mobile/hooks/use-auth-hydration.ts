import { UserProfile } from '@cro/shared';
import { useEffect, useState } from 'react';

import { apiClient } from '@/api/client';
import { clearTokens, getAccessToken } from '@/api/token-storage';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/auth.slice';

/** Check for stored tokens on app launch and restore auth state */
export function useAuthHydration() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const { data } = await apiClient.get<UserProfile>('/users/me');
        dispatch(setUser(data));
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch]);

  return isLoading;
}
