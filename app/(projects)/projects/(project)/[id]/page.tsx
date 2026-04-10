import DashboardCard from "@/components/dashboard/DashboardCard";

export default function ProjectPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Hello, Justine</h1>
      </div>
      <section>
        <div className="flex space-x-2">
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
        </div>
      </section>
    </div>
  );
}
