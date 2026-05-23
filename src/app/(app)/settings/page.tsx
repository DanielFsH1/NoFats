import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { person } = await requireUser();

  redirect(`/people/${person.id}`);
}
