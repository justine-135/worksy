const stats = [
  { value: "2021", label: "Worksy Founded" },
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
];

export default function StatsSection() {
  return (
    <section className="bg-surface px-6 pb-20">
      <div className="mx-auto grid max-w-4xl gap-8 rounded-3xl bg-surface-muted px-6 py-12 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-subtle">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
