import { getPermissions } from "@/db/permission.db";

export async function GET() {
  const data = await getPermissions();

  return Response.json(data);
}
