import { AppShell } from "@/components/app-shell";
import { getAppSettings } from "@/lib/data/settings";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const { siteCopy } = await getAppSettings();

  return (
    <AppShell appName={siteCopy.appName} user={{ name: user.name, role: user.role }}>
      {children}
    </AppShell>
  );
}
