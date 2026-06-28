export function AppPageTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  if (action) {
    return (
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{children}</h1>
        {action}
      </div>
    );
  }

  return <h1 className="mb-6 text-2xl font-bold text-slate-900">{children}</h1>;
}
