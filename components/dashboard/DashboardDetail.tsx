import React from "react";

import DashboardCard from "./DashboardCard";

export default function DashboardDetail() {
  return (
    <div className="flex flex-col space-y-6">
      <section>
        <div className="flex flex-wrap space-x-2">
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
          <DashboardCard title="Total" content="12" />
        </div>
      </section>
    </div>
  );
}
