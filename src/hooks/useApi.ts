"use client"

import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: React.DependencyList = [],
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options?.immediate !== false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
        options?.onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    if (options?.immediate !== false) {
      execute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    refetch: execute,
    setData,
  };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, params?: Record<string, unknown>) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialParams?: Record<string, unknown>,
  options?: {
    initialPage?: number;
    initialLimit?: number;
    immediate?: boolean;
    onSuccess?: (data: PaginatedResponse<T>) => void;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: options?.initialPage || 1,
    limit: options?.initialLimit || 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState<Record<string, unknown>>(initialParams || {});
  const [isLoading, setIsLoading] = useState(options?.immediate !== false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (page?: number, limit?: number, newParams?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    const currentPage = page ?? pagination.page;
    const currentLimit = limit ?? pagination.limit;
    const currentParams = newParams ?? params;

    try {
      const response = await apiCall(currentPage, currentLimit, currentParams);
      if (response.success && response.data) {
        setData(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          totalItems: response.data.total_items,
          totalPages: response.data.total_pages,
        });
        options?.onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, params]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchData(page);
  }, [fetchData]);

  const setPageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    fetchData(1, limit);
  }, [fetchData]);

  const updateParams = useCallback((newParams: Record<string, unknown>) => {
    setParams(newParams);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData(1, pagination.limit, newParams);
  }, [fetchData, pagination.limit]);

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: () => fetchData(),
    goToPage,
    setPageSize,
    updateParams,
    setData,
  };
}

// Hook for mutation operations (create, update, delete)
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  }
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    let resultData: TData | null = null;
    let resultError: Error | null = null;

    try {
      const response = await mutationFn(variables);
      if (response.success) {
        resultData = response.data;
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data, variables);
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (err) {
      resultError = err instanceof Error ? err : new Error('Unknown error');
      setError(resultError);
      options?.onError?.(resultError, variables);
    } finally {
      setIsLoading(false);
      options?.onSettled?.(resultData, resultError, variables);
    }

    return { data: resultData, error: resultError };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    isSuccess,
    mutate,
    reset,
  };
}
