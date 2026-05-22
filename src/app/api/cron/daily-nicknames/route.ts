import { materializeDailyNicknames } from "@/lib/data/daily";
import { getDateKey } from "@/lib/product/dates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const dateKey = getDateKey();
  await materializeDailyNicknames(dateKey);

  return Response.json({ ok: true, dateKey });
}
