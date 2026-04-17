import BoardComponent from "@/components/board/BoardComponent";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  return <BoardComponent userId={session?.user?.id ?? ""} projectId={id} />;
}
