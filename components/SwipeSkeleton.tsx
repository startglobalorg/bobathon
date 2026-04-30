export function SwipeSkeleton() {
  return (
    <div className="flex-1 flex flex-col" aria-hidden>
      <div
        className="relative w-full mt-2 mx-auto rounded-3xl border border-border overflow-hidden bg-white shadow-soft flex flex-col"
        style={{
          maxWidth: 380,
          aspectRatio: '4 / 5',
          maxHeight: 'calc(100dvh - 360px)',
        }}
      >
        <div className="flex-1 apartner-skeleton" />
        <div className="p-5 pb-6 space-y-2.5">
          <div className="h-3 w-1/3 rounded apartner-skeleton" />
          <div className="h-5 w-3/4 rounded apartner-skeleton" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-6 w-16 rounded-full apartner-skeleton" />
            <div className="h-6 w-14 rounded-full apartner-skeleton" />
            <div className="h-6 w-24 rounded-full apartner-skeleton" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-7 mt-7">
        <div className="w-16 h-16 rounded-full apartner-skeleton" />
        <div className="w-16 h-16 rounded-full apartner-skeleton" />
      </div>
    </div>
  );
}
