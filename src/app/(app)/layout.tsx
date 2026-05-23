import { AppShell } from "@/components/app-shell";
import { getPeopleSummaries } from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, person } = await requireUser();
  const [{ siteCopy }, people] = await Promise.all([
    getAppSettings(),
    getPeopleSummaries(undefined, { includeAdminProfiles: true }),
  ]);
  const displayName =
    people.find((summary) => summary.id === person.id)?.displayName ??
    user.name;

  return (
    <AppShell
      appName={siteCopy.appName}
      user={{ name: displayName, role: user.role, personId: person.id }}
    >
      {children}
    </AppShell>
  );
}
