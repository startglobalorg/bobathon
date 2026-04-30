export function StatusSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section>
        <div className="h-3 w-40 rounded apartner-skeleton mb-3" />
        <div className="space-y-2.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-3 flex gap-3"
            >
              <div className="w-20 h-20 rounded-xl apartner-skeleton flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1.5">
                <div className="space-y-2">
                  <div className="h-3 w-1/3 rounded apartner-skeleton" />
                  <div className="h-4 w-3/4 rounded apartner-skeleton" />
                </div>
                <div className="h-5 w-24 rounded-full apartner-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
