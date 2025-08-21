import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@constants/paths";

export default function PostListSection() {
  const themeIcon = useThemeIcon();

  const { freeIcon, githubIcon, infoIcon, jobsIcon, surveyIcon } =
    useMemo(() => {
      const dark = themeIcon === "oz_dark";
      return {
        freeIcon: dark ? icons.free.dark : icons.free.light,
        githubIcon: dark ? icons.github.dark : icons.github.light,
        infoIcon: dark ? icons.info.dark : icons.info.light,
        jobsIcon: dark ? icons.jobs.dark : icons.jobs.light,
        surveyIcon: dark ? icons.survey.dark : icons.survey.light,
      };
    }, [themeIcon]);

  const boardList = [
    {
      key: "free",
      label: "자유 게시판",
      icon: freeIcon,
      path: PATHS.FREE_BOARD,
    },
    {
      key: "jobs",
      label: "취업 게시판",
      icon: jobsIcon,
      path: PATHS.JOBS_BOARD,
    },
    {
      key: "info",
      label: "정보 게시판",
      icon: infoIcon,
      path: PATHS.INFO_BOARD,
    },
    {
      key: "survey",
      label: "설문 게시판",
      icon: surveyIcon,
      path: PATHS.SURVEY_BOARD,
    },
    {
      key: "github",
      label: "GitHub 게시판",
      icon: githubIcon,
      path: PATHS.GITHUB_BOARD,
    },
  ];
  return (
    <>
      <div className="w-[240px] rounded-md p-2 bg-base-300/30">
        <p className="text-xs text-neutral-content">게시판</p>
        <div className="flex flex-col py-2 items-center space-y-2">
          {boardList.map(({ key, label, icon, path }) => (
            <Link
              key={key}
              to={path}
              className="w-[220px] h-[40px] px-[10px] flex items-center gap-2 rounded-md cursor-pointer hover:bg-base-300/45"
            >
              <img key={icon} src={icon} alt={`${label} 아이콘`} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
