import type { Source } from "@src/types/job";

export default function LeftTabs({
  value,
  onChange,
}: {
  value: Source;
  onChange: (s: Source) => void;
}) {
  const tabs: { key: Source; label: string }[] = [
    { key: "remoteok", label: "원격" },
    { key: "arbeitnow", label: "해외" },
    { key: "ashby", label: "스타트업" },
  ];

  return (
    <div className="flex gap-2 border-b border-base-300">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            value === t.key
              ? "text-primary border-primary"
              : "text-neutral-content border-transparent hover:text-base-content"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
