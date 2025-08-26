/* eslint-disable @typescript-eslint/no-explicit-any */
// Toast UI Viewer (dist 빌드) 모듈 선언
declare module "@toast-ui/editor/dist/toastui-editor-viewer" {
  // 정식 타입 패키지가 없으므로 최소 인터페이스만 선언
  type ViewerPlugin = any;

  export default class Viewer {
    constructor(options: {
      el: HTMLElement;
      initialValue?: string;
      usageStatistics?: boolean;
      plugins?: ViewerPlugin[];
      // 필요하면 옵션 계속 추가
    });
    setMarkdown(markdown: string): void;
    getMarkdown(): string;
    destroy(): void;
  }
}

// 코드 하이라이트 플러그인도 타입이 없으므로 함께 선언
declare module "@toast-ui/editor-plugin-code-syntax-highlight" {
  const plugin: any;
  export default plugin;
}
