export default function CharacterPanelSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="bg-surface border border-hairline rounded-lg p-5">
        <div className="skeleton h-3 w-10 rounded mb-2" />
        <div className="skeleton h-12 w-16 rounded mb-4" />
        <div className="skeleton h-1.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-hairline rounded-lg p-4 h-20 skeleton" />
        <div className="bg-surface border border-hairline rounded-lg p-4 h-20 skeleton" />
      </div>
      <div className="bg-surface border border-hairline rounded-lg p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="border border-hairline rounded-lg p-4 flex items-center gap-4" aria-hidden="true">
      <div className="skeleton h-5 w-5 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

/* commit_stage_22_ayush */
