import { useState, useCallback, useMemo } from "react";

export interface HttpError {
  status: number;
  message: string;
  description?: string;
}

interface UseHttpStatusReturn {
  currentError: HttpError | null;
  setError: (status: number, customMessage?: string) => void;
  clearError: () => void;
  isClientError: boolean;
  isServerError: boolean;
  getErrorConfig: () => ErrorPageConfig | null;
}

interface ErrorPageConfig {
  title: string;
  message: string;
  description: string;
  showRetry: boolean;
  showHome: boolean;
}

const ERROR_CONFIGS: Record<number, ErrorPageConfig> = {
  403: {
    title: "접근 금지",
    message: "이 페이지에 접근할 권한이 없습니다",
    description: "관리자에게 문의하거나 다른 페이지를 이용해 주세요.",
    showRetry: false,
    showHome: true,
  },
  404: {
    title: "페이지를 찾을 수 없습니다",
    message: "요청하신 페이지가 존재하지 않습니다",
    description: "URL을 확인하시거나 홈페이지로 돌아가 주세요.",
    showRetry: false,
    showHome: true,
  },
  500: {
    title: "서버 오류",
    message: "내부 서버 오류가 발생했습니다",
    description: "잠시 후 다시 시도하거나 관리자에게 문의해 주세요.",
    showRetry: true,
    showHome: true,
  },
};

export const useHttpStatus = (): UseHttpStatusReturn => {
  const [currentError, setCurrentError] = useState<HttpError | null>(null);

  const setError = useCallback((status: number, customMessage?: string) => {
    const config = ERROR_CONFIGS[status];
    if (!config) return;

    const error: HttpError = {
      status,
      message: customMessage || config.message,
      description: config.description,
    };

    setCurrentError(error);
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const isClientError = useMemo(() => {
    return currentError
      ? currentError.status >= 400 && currentError.status < 500
      : false;
  }, [currentError]);

  const isServerError = useMemo(() => {
    return currentError ? currentError.status >= 500 : false;
  }, [currentError]);

  const getErrorConfig = useCallback((): ErrorPageConfig | null => {
    if (!currentError) return null;
    return ERROR_CONFIGS[currentError.status] || null;
  }, [currentError]);

  return {
    currentError,
    setError,
    clearError,
    isClientError,
    isServerError,
    getErrorConfig,
  };
};
