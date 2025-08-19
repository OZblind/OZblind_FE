import React from "react";

export const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `${hours}시간 전`;
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString();
  }
};

export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;

  try {
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-black px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch (error) {
    console.warn("Regex creation failed for query:", query, error);
    return text;
  }
};
