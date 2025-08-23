import banner1 from "@assets/images/banner/course_bootcamp_01-1.png";
import banner2 from "@assets/images/banner/course_bootcamp_02-2.png";
import banner3 from "@assets/images/banner/course_bootcamp_03-2.png";
import banner4 from "@assets/images/banner/course_bootcamp_07.png";
import banner5 from "@assets/images/banner/course_bootcamp_08-2.png";
import banner6 from "@assets/images/banner/course_bootcamp_09-1.png";
import banner7 from "@assets/images/banner/course_bootcamp_10-1.png";

interface Banner {
  src: string;
  contant: string;
  tag: string;
  href: string;
  alt?: string;
}

const banners: Banner[] = [
  {
    src: banner1,
    contant: "초격자 캠프",
    tag: "프론트엔드, 백엔드, 온라인",
    href: "https://ozcodingschool.com/ozcoding/startupcamp",
    alt: "banner1",
  },
  {
    src: banner2,
    contant: "사업개발 캠프",
    tag: "창업, 온라인",
    href: "https://ozcodingschool.com/ozcoding/bizdevcamp",
    alt: "banner2",
  },
  {
    src: banner3,
    contant: "프로덕트 디자이너 캠프",
    tag: "UX/UI, 디자인, 온라인",
    href: "https://ozcodingschool.com/ozcoding/proddesigncamp",
    alt: "banner3",
  },
  {
    src: banner4,
    contant: "1인 창업 개발부트캠프",
    tag: "프론트엔드, 창업, 온라인",
    href: "https://ozcodingschool.com/ozcoding/solofoundercamp",
    alt: "banner4",
  },
  {
    src: banner5,
    contant: "게임 개발 초격자 캠프",
    tag: "유니티, 온라인",
    href: "https://ozcodingschool.com/ozcoding/gamedevcamp",
    alt: "banner5",
  },
  {
    src: banner6,
    contant: "AI 리더 캠프",
    tag: "AI, 창업PM, 바이브코딩",
    href: "https://ozcodingschool.com/ozcoding/aileadercamp",
    alt: "banner6",
  },
  {
    src: banner7,
    contant: "AI 헬스케어 캠프",
    tag: "의료AI, 웹개발, 데이터 분석",
    href: "https://ozcodingschool.com/ozcoding/aileadercamp",
    alt: "banner7",
  },
];

export default function AdBanner() {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden p-3">
      <p className="w-full text-sm text-info mb-2">
        오즈에서 새로운 수강생 모집중!
      </p>
      <div>
        {banners.map((banner, idx) => (
          <a
            key={idx}
            href={banner.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex bg-base-200 rounded overflow-hidden mb-2 hover:scale-105 transition-transform">
              <img
                src={banner.src}
                alt={banner.alt}
                className="block w-[100px] h-auto"
              />
              <div className="p-1">
                <p className="text-sm">{banner.contant}</p>
                <p className="text-xs text-primary-content/50">{banner.tag}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
