import ProjectsComponent from "@/components/projects/ProjectsComponent";

export default function ProjectPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Hello, Justine</h1>
      </div>
      <section>
        <ProjectsComponent />
      </section>
    </div>
  );
}
