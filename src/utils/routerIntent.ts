// 사용자가 최초로 접속하려고 한(의도한) 경로 설정

const KEY = "intent:path";

export const setIntendedPath = (path: string) => {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // noop (no operation)
  }
};

export const getIntendedPath = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const clearIntendedPath = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // noop
  }
};
