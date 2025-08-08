export function UserSetting() {
  return (
    <>
      <div className="fixed inset-0 bg-base-200 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-base-200 rounded-md p-6 max-w-md w-full h-[500px]">
          <div className="flex justify-between">
            <div className="font-thin">설정</div>
            <button className="px-4 bg-base-300 text-white py-2 rounded-full hover:bg-secondary transition">
              X
            </button>
          </div>

          <div className="border-b border-neutral-content py-6">
            다크 모드 설정
          </div>

          <div className="py-4">
            <p className="mb-2">오즈 스쿨 사용자 인증 Key</p>

            <div>
              <input
                type="text"
                placeholder="회원 Key 입력"
                className="mr-2 bg-base-300 border border-base-200 p-2 focus:outline-none focus:border-primary"
              />
              <button className="px-4 bg-primary text-white py-2 rounded hover:bg-secondary transition">
                인증
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
