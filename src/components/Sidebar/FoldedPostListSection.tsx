import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { useMemo } from "react";

export default function FoldedPostListSection() {
  const themeIcon = useThemeIcon();

  const { freeIcon, githubIcon, informationIcon, jobsIcon, surveyIcon } =
    useMemo(() => {
      const dark = themeIcon === "oz_dark";
      return {
        freeIcon: dark ? icons.free.dark : icons.free.light,
        githubIcon: dark ? icons.github.dark : icons.github.light,
        informationIcon: dark
          ? icons.information.dark
          : icons.information.light,
        jobsIcon: dark ? icons.jobs.dark : icons.jobs.light,
        surveyIcon: dark ? icons.survey.dark : icons.survey.light,
      };
    }, [themeIcon]);

  const boardButtons = [
    { key: "free", icon: freeIcon, alt: "freeIcon" },
    { key: "jobs", icon: jobsIcon, alt: "jobsIcon" },
    { key: "information", icon: informationIcon, alt: "informationIcon" },
    { key: "survey", icon: surveyIcon, alt: "surveyIcon" },
    { key: "github", icon: githubIcon, alt: "githubIcon" },
  ];

  return (
    <div className="flex flex-col gap-3 p-1 py-2 bg-base-100/80 rounded-md">
      {boardButtons.map(({ key, icon, alt }) => (
        <button key={key} className="p-1.5 rounded-full hover:bg-base-300">
          <img src={icon} alt={alt} />
        </button>
      ))}
    </div>
  );
}
