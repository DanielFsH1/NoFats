import { materializeDailyNicknames } from "@/lib/data/daily";
import { rejectExpiredProposals } from "@/lib/data/proposal-expiration";
import { getDateKey } from "@/lib/product/dates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const dateKey = getDateKey();
  await Promise.all([materializeDailyNicknames(dateKey), rejectExpiredProposals()]);

  return Response.json({ ok: true, dateKey });
}
