import BoardComponent from "@/components/board/BoardComponent";
import { getTaskBoard } from "@/db/taskboard.db";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function BoardPage() {
  const session = await getServerSession(authConfig);
  const data = await getTaskBoard(session?.user.id || "");
  return <BoardComponent data={data} />;
}
