import { useEffect } from "react";
import { useScrollRoot } from "./useScrollRoot";

/** 맨 위로 가기 기본 루트 보장 헬퍼 */
export default function EnsureDefaultScrollRoot({
  elRef,
}: {
  elRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { root, setRoot } = useScrollRoot();
  useEffect(() => {
    if (!root && elRef.current) setRoot(elRef.current);
  }, [root, setRoot, elRef]);
  return null;
}
