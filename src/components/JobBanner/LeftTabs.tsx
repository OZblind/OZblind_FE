import type { Source } from "@src/types/job";

export default function LeftTabs({
  value,
  onChange,
}: {
  value: Source;
  onChange: (s: Source) => void;
}) {
  const tabs: { key: Source; label: string }[] = [
    { key: "remoteok", label: "RemoteOK" },
    { key: "arbeitnow", label: "Arbeitnow" },
    { key: "ashby", label: "Ashby" },
  ];
  return (
    <aside className="w-40 border-r border-base-300 p-2">
      <ul className="flex flex-col gap-2">
        {tabs.map((t) => (
          <li key={t.key}>
            <button
              onClick={() => onChange(t.key)}
              className={`w-full rounded px-3 py-2 ${
                value === t.key ? "bg-primary text-white" : "hover:bg-base-200"
              }`}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
