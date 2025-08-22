import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@src/constants/paths";

export default function FoldedPostListSection() {
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

  const boardButtons = [
    { key: "free", icon: freeIcon, alt: "freeIcon", path: PATHS.FREE_BOARD },
    { key: "jobs", icon: jobsIcon, alt: "jobsIcon", path: PATHS.JOBS_BOARD },
    {
      key: "info",
      icon: infoIcon,
      alt: "infoIcon",
      path: PATHS.INFO_BOARD,
    },
    {
      key: "survey",
      icon: surveyIcon,
      alt: "surveyIcon",
      path: PATHS.SURVEY_BOARD,
    },
    {
      key: "github",
      icon: githubIcon,
      alt: "githubIcon",
      path: PATHS.GITHUB_BOARD,
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-1 py-2 bg-base-100/80 rounded-md">
      {boardButtons.map(({ key, icon, alt, path }) => (
        <Link
          key={key}
          to={path}
          className="p-1.5 rounded-full hover:bg-base-300"
        >
          <img src={icon} alt={alt} />
        </Link>
      ))}
    </div>
  );
}
