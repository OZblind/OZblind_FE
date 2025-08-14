import type { Ref } from "react";

type ScrollSentinelProps = {
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
};

/**
 * 화면 하단에 두는 "관찰용 앵커" 컴포넌트.
 * 디자인 관여 없음(투명/레이아웃만 유지).
 */
export default function ScrollSentinel({
  className,
  innerRef,
}: ScrollSentinelProps) {
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      className={className ?? "h-1 w-full"}
    />
  );
}
