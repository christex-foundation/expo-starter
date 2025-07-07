import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/src/types/global.types';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An unexpected error occurred',
      code: response.status.toString(),
      statusCode: response.status,
    }));
    throw error;
  }

  return response.json();
}

// Generic query hook
export function useApiQuery<T>(
  key: string | string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key];
  
  return useQuery<T, ApiError>({
    queryKey,
    queryFn: () => fetchApi<T>(endpoint),
    ...options,
  });
}

// Generic mutation hook
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      return fetchApi<TData>(endpoint, {
        method,
        body: JSON.stringify(variables),
      });
    },
    ...options,
  });
}