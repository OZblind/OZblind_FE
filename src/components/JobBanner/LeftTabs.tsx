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
    { key: "ashby", label: "신생" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded px-3 py-2 text-sm ${
            value === t.key ? "bg-primary text-white" : "hover:bg-base-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
