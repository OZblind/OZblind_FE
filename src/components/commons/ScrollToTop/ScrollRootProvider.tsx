import { useCallback, useState, type ReactNode } from "react";
import { ScrollRootContext, type ScrollRoot } from "./scroll-root-store";

export default function ScrollRootProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [root, setRootState] = useState<ScrollRoot>(null);
  const setRoot = useCallback((el: ScrollRoot) => setRootState(el), []);
  return (
    <ScrollRootContext.Provider value={{ root, setRoot }}>
      {children}
    </ScrollRootContext.Provider>
  );
}
