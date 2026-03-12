interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-midnight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sand-500 text-sm mt-0.5">{subtitle}</p>
      )}
    </header>
  );
}
