export default function AdYoutube() {
  return (
    <div className="w-[260px] p-3">
      <p className="w-full text-sm text-info mb-2">
        오즈에만 있는 소수정예 개발 부트캠프
      </p>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/hgENCvU5AVY?si=LiX8bkYCqBqZ0yTt"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-auto"
      ></iframe>
    </div>
  );
}
