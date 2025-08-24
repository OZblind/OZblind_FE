import { API_BASE_URL } from "@src/config/env";
import axios, { AxiosError } from "axios";
import { tokenStore } from "./client";

interface DeleteAccountResponse {
  status: "success";
  message: string;
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  const accessToken = tokenStore.access;
  if (!accessToken) {
    throw new Error("로그인 후에만 회원 탈퇴가 가능합니다.");
  }

  try {
    const response = await axios.post<DeleteAccountResponse>(
      `${API_BASE_URL}/api/delete`,
      {}, // body가 필요 없다면 빈 객체
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // 토큰 추가
        },
      }
    );

    tokenStore.clear(); // 탈퇴 성공 시 토큰 삭제
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response?.data?.error) {
      if (err.response.data.error === "re-auth failed") {
        throw new Error("재인증이 필요합니다.");
      } else {
        throw new Error("회원 탈퇴 중 오류가 발생했습니다.");
      }
    }
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("회원 탈퇴 중 알 수 없는 오류가 발생했습니다.");
  }
}
