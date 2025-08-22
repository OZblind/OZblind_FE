// Logo
export { default as logoColor } from "./logos/logo-color.svg";
export { default as logoColorV2 } from "./logos/logo-color-v2.svg";
export { default as logoDark } from "./logos/logo-dark.svg";
export { default as logoDarkV2 } from "./logos/logo-dark-v2.svg";
export { default as logoLight } from "./logos/logo-light.svg";
export { default as logoLightV2 } from "./logos/logo-light-v2.svg";
export { default as ozFavicon } from "./logos/oz-favicon.svg";
export { default as ozSymbolDark } from "./logos/oz-symbol-dark.svg";
export { default as ozSymbolLight } from "./logos/oz-symbol-light.svg";

// Icons
export { default as iconArrowUpwardDark } from "./icons/icon-arrow-upward-dark.svg";
export { default as iconArrowUpwardLight } from "./icons/icon-arrow-upward-light.svg";

export { default as iconBookmarkColor } from "./icons/icon-bookmark-color.svg";
export { default as iconBookmarkDark } from "./icons/icon-bookmark-dark.svg";
export { default as iconBookmarkLight } from "./icons/icon-bookmark-light.svg";

export { default as iconDeleteDark } from "./icons/icon-delete-dark.svg";
export { default as iconDeleteLight } from "./icons/icon-delete-light.svg";
export { default as iconDelete } from "./icons/icon-delete.svg";

export { default as iconFilterListDark } from "./icons/icon-filter-list-dark.svg";
export { default as iconFilterListLight } from "./icons/icon-filter-list-light.svg";

export { default as iconFreeDark } from "./icons/icon-free-dark.svg";
export { default as iconFreeLight } from "./icons/icon-free-light.svg";

export { default as iconGithubDark } from "./icons/icon-github-dark.svg";
export { default as iconGithubLight } from "./icons/icon-github-light.svg";

export { default as iconInfoDark } from "./icons/icon-info-dark.svg";
export { default as iconInfoLight } from "./icons/icon-info-light.svg";

export { default as iconJobsDark } from "./icons/icon-jobs-dark.svg";
export { default as iconJobsLight } from "./icons/icon-jobs-light.svg";

export { default as iconKeyboardArrowDownDark } from "./icons/icon-keyboard-arrow-down-dark.svg";
export { default as iconKeyboardArrowDownLight } from "./icons/icon-keyboard-arrow-down-light.svg";
export { default as iconKeyboardArrowUpDark } from "./icons/icon-keyboard-arrow-up-dark.svg";
export { default as iconKeyboardArrowUpLight } from "./icons/icon-keyboard-arrow-up-light.svg";

export { default as iconLabelDark } from "./icons/icon-label-dark.svg";
export { default as iconLabelLight } from "./icons/icon-label-light.svg";

export { default as iconLogoutBtnHoverDark } from "./icons/icon-logout-btn-hover-dark.svg";
export { default as iconLogoutBtnHoverLight } from "./icons/icon-logout-btn-hover-light.svg";
export { default as iconLogoutBtn } from "./icons/icon-logout-btn.svg";

export { default as iconMenuDark } from "./icons/icon-menu-dark.svg";
export { default as iconMenuLight } from "./icons/icon-menu-light.svg";

export { default as iconNotificationsDark } from "./icons/icon-notifications-dark.svg";
export { default as iconNotificationsLight } from "./icons/icon-notifications-light.svg";
export { default as iconNotificationsOnDark } from "./icons/icon-notifications-on-dark.svg";
export { default as iconNotificationsOnLight } from "./icons/icon-notifications-on-light.svg";

export { default as iconSearch } from "./icons/icon-search.svg";

export { default as iconSurveyDark } from "./icons/icon-survey-dark.svg";
export { default as iconSurveyLight } from "./icons/icon-survey-light.svg";
export { default as iconMypageWritingDark } from "./icons/icon-mypage-bookmark-dark.svg";
export { default as iconMypageWritingLight } from "./icons/icon-mypage-bookmark-light.svg";
export { default as iconMypageChatDark } from "./icons/icon-mypage-chat-dark.svg";
export { default as iconMypageChatLight } from "./icons/icon-mypage-chat-light.svg";
export { default as iconMypageBookmarkDark } from "./icons/icon-mypage-bookmark-dark.svg";
export { default as iconMypageBookmarkLight } from "./icons/icon-mypage-writing-light.svg";

export { default as iconThumbDownColor } from "./icons/icon-thumb-down-color.svg";
export { default as iconThumbDownDark } from "./icons/icon-thumb-down-dark.svg";
export { default as iconThumbDownLight } from "./icons/icon-thumb-down-light.svg";

export { default as iconThumbUpColor } from "./icons/icon-thumb-up-color.svg";
export { default as iconThumbUpDark } from "./icons/icon-thumb-up-dark.svg";
export { default as iconThumbUpLight } from "./icons/icon-thumb-up-light.svg";

// Images
export { default as person } from "./images/person.png";
export { default as settings } from "./images/settings.png";

import { Bookmark } from "lucide-react";
// Logo, Icons 테마별 객체로 정리
import {
  logoColor,
  logoColorV2,
  logoDark,
  logoDarkV2,
  logoLight,
  logoLightV2,
  ozFavicon,
  ozSymbolDark,
  ozSymbolLight,
  iconArrowUpwardDark,
  iconArrowUpwardLight,
  iconBookmarkColor,
  iconBookmarkDark,
  iconBookmarkLight,
  iconDeleteDark,
  iconDeleteLight,
  iconDelete,
  iconFilterListDark,
  iconFilterListLight,
  iconFreeDark,
  iconFreeLight,
  iconGithubDark,
  iconGithubLight,
  iconInfoDark,
  iconInfoLight,
  iconJobsDark,
  iconJobsLight,
  iconKeyboardArrowDownDark,
  iconKeyboardArrowDownLight,
  iconKeyboardArrowUpDark,
  iconKeyboardArrowUpLight,
  iconLabelDark,
  iconLabelLight,
  iconLogoutBtnHoverDark,
  iconLogoutBtnHoverLight,
  iconLogoutBtn,
  iconMenuDark,
  iconMenuLight,
  iconNotificationsDark,
  iconNotificationsLight,
  iconNotificationsOnDark,
  iconNotificationsOnLight,
  iconSearch,
  iconSurveyDark,
  iconSurveyLight,
  iconThumbDownColor,
  iconThumbDownDark,
  iconThumbDownLight,
  iconThumbUpColor,
  iconThumbUpDark,
  iconThumbUpLight,
  iconMypageBookmarkDark,
  iconMypageBookmarkLight,
  iconMypageChatDark,
  iconMypageChatLight,
  iconMypageWritingDark,
  iconMypageWritingLight,
} from ".";

export const logos = {
  main: {
    color: {
      v1: logoColor,
      v2: logoColorV2,
    },
    dark: {
      v1: logoDark,
      v2: logoDarkV2,
    },
    light: {
      v1: logoLight,
      v2: logoLightV2,
    },
  },
  favicon: ozFavicon,
  symbol: {
    dark: ozSymbolDark,
    light: ozSymbolLight,
  },
};

export const icons = {
  arrowUpward: {
    dark: iconArrowUpwardDark,
    light: iconArrowUpwardLight,
  },
  bookmark: {
    dark: iconBookmarkDark,
    light: iconBookmarkLight,
    color: iconBookmarkColor,
  },
  delete: {
    default: iconDelete,
    dark: iconDeleteDark,
    light: iconDeleteLight,
  },
  filterList: {
    dark: iconFilterListDark,
    light: iconFilterListLight,
  },
  free: {
    dark: iconFreeDark,
    light: iconFreeLight,
  },
  github: {
    dark: iconGithubDark,
    light: iconGithubLight,
  },
  info: {
    dark: iconInfoDark,
    light: iconInfoLight,
  },
  jobs: {
    dark: iconJobsDark,
    light: iconJobsLight,
  },
  keyboardArrowDown: {
    dark: iconKeyboardArrowDownDark,
    light: iconKeyboardArrowDownLight,
  },
  keyboardArrowUp: {
    dark: iconKeyboardArrowUpDark,
    light: iconKeyboardArrowUpLight,
  },
  label: {
    dark: iconLabelDark,
    light: iconLabelLight,
  },
  logoutBtn: {
    default: iconLogoutBtn,
    hover: {
      dark: iconLogoutBtnHoverDark,
      light: iconLogoutBtnHoverLight,
    },
  },
  menu: {
    dark: iconMenuDark,
    light: iconMenuLight,
  },
  notifications: {
    dark: iconNotificationsDark,
    light: iconNotificationsLight,
  },
  notificationsOn: {
    dark: iconNotificationsOnDark,
    light: iconNotificationsOnLight,
  },
  search: {
    default: iconSearch,
  },
  survey: {
    dark: iconSurveyDark,
    light: iconSurveyLight,
  },
  thumbDown: {
    dark: iconThumbDownDark,
    light: iconThumbDownLight,
    color: iconThumbDownColor,
  },
  thumbUp: {
    dark: iconThumbUpDark,
    light: iconThumbUpLight,
    color: iconThumbUpColor,
  },
  writing: {
    dark: iconMypageWritingDark,
    light: iconMypageWritingLight,
  },
  chat: {
    dark: iconMypageChatDark,
    light: iconMypageChatLight,
  },
  Bookmark: {
    dark: iconMypageBookmarkDark,
    light: iconMypageBookmarkLight,
  },
};
