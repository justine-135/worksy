const stats = [
  { value: "2021", label: "Worksy Founded" },
  { value: "50K+", label: "Active Users" },
  { value: "1k+", label: "Company Partners" },
];

export default function StatsSection() {
  return (
    <section className="bg-white px-6 pb-20">
      <div className="mx-auto grid max-w-4xl gap-8 rounded-3xl bg-[#f6f7f4] px-6 py-12 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-semibold tracking-tight text-emerald-950">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-emerald-950/50">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
