export default function PostListSection() {
  const boardList = [
    "자유 게시판",
    "취업 게시판",
    "정보 게시판",
    "설문 게시판",
    "GitHub 게시판",
  ];

  return (
    <>
      <div className="w-[240px] rounded-md p-2 bg-base-300/30">
        <p className="text-xs text-neutral-content">게시판</p>
        <div className="flex flex-col py-2 items-center space-y-2">
          {boardList.map((name) => (
            <div
              key={name}
              className="w-[220px] h-[40px] px-[10px] flex items-center rounded-md cursor-pointer hover:bg-base-300/45"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
