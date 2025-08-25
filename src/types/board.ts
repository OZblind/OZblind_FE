export type BaseEditProps = {
  mode?: "create" | "edit"; // 기본 create
  postId?: number; // edit일 때 필요
  initial?: {
    title: string;
    content: string;
    // 설문/깃허브는 아래처럼 개별 필드 추가
    formLink?: string; // survey
    endDate?: string; // survey
    repoUrl?: string; // github
  };
  onCancel?: () => void;
  onSubmitted?: () => void; // 저장 후 콜백 (네비게이션 등)
};
