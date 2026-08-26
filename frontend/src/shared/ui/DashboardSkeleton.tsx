import React from "react";

const DashboardSkeleton = () => {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HERO */}
        <section className="animate-pulse rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="h-6 w-36 rounded-full bg-muted" />
              <div className="h-9 w-72 max-w-full rounded-lg bg-muted" />
              <div className="h-4 w-96 max-w-full rounded bg-muted" />
            </div>

            <div className="h-11 w-44 rounded-xl bg-muted" />
          </div>
        </section>

        {/* OVERVIEW */}
        <section>
          <div className="mb-4 space-y-2">
            <div className="h-6 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-52 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-muted" />
                  <div className="h-4 w-4 rounded bg-muted" />
                </div>

                <div className="mt-5 h-4 w-20 rounded bg-muted" />
                <div className="mt-2 h-8 w-12 rounded bg-muted" />
                <div className="mt-2 h-3 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </section>

        {/* SCHEDULE + TASKS */}
        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">

          {/* SCHEDULE */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex animate-pulse items-center justify-between border-b border-border px-5 py-4">
              <div className="space-y-2">
                <div className="h-5 w-36 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>

              <div className="h-9 w-9 rounded-xl bg-muted" />
            </div>

            <div className="space-y-3 p-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-border bg-muted/50 p-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-56 max-w-full rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="mx-auto h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* TASKS */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex animate-pulse items-center justify-between border-b border-border px-5 py-4">
              <div className="space-y-2">
                <div className="h-5 w-20 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>

              <div className="h-9 w-9 rounded-xl bg-muted" />
            </div>

            <div className="space-y-2.5 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-3 rounded-xl border border-border bg-muted/50 p-3"
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-muted" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-40 max-w-full rounded bg-muted" />

                    <div className="flex gap-2">
                      <div className="h-4 w-12 rounded bg-muted" />
                      <div className="h-4 w-16 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </section>

        {/* AI ASSISTANT */}
        <section className="animate-pulse rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />

              <div className="space-y-2">
                <div className="h-5 w-36 rounded bg-muted" />
                <div className="h-3 w-72 max-w-full rounded bg-muted" />
              </div>
            </div>

            <div className="h-10 w-32 rounded-xl bg-muted" />
          </div>
        </section>

        {/* GMAIL + DRIVE */}
        <section className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex animate-pulse items-center justify-between border-b border-border px-5 py-4">
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>

                <div className="h-9 w-9 rounded-xl bg-muted" />
              </div>

              <div className="p-5">
                <div className="flex animate-pulse items-center gap-3 rounded-xl border border-border bg-muted/50 p-4">
                  <div className="h-9 w-9 rounded-lg bg-muted" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="h-3 w-64 max-w-full rounded bg-muted" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4">
                <div className="mx-auto h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="flex justify-center pb-5 pt-1">
          <div className="h-3 w-72 animate-pulse rounded bg-muted" />
        </footer>

      </div>
    </main>
  );
};

export default DashboardSkeleton;