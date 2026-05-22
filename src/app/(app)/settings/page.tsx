import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "@/lib/actions/app-actions";
import { getPersonProfile } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { person } = await requireUser();
  const profile = await getPersonProfile(person.id);

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-black">Mi perfil</h1>
        <p className="mt-2 text-[var(--muted)]">
          Personaliza tu bio, descripcion, frase y color.
        </p>
      </div>
      <section className="surface rounded-[28px] p-6">
        <form action={updateProfileAction} className="space-y-4">
          <input type="hidden" name="personId" value={profile.person.id} />
          <label className="block text-sm font-semibold">
            Nombre completo
            <input
              name="fullName"
              defaultValue={profile.person.fullName ?? ""}
              className="field mt-2 h-12 w-full px-3"
            />
          </label>
          <label className="block text-sm font-semibold">
            Bio
            <input
              name="bio"
              defaultValue={profile.person.bio}
              className="field mt-2 h-12 w-full px-3"
            />
          </label>
          <label className="block text-sm font-semibold">
            Descripcion
            <textarea
              name="description"
              defaultValue={profile.person.description}
              className="field mt-2 min-h-32 w-full p-3"
            />
          </label>
          <label className="block text-sm font-semibold">
            Frase
            <input
              name="phrase"
              defaultValue={profile.person.phrase}
              className="field mt-2 h-12 w-full px-3"
            />
          </label>
          <label className="block text-sm font-semibold">
            Color del perfil
            <input
              name="themeColor"
              type="color"
              defaultValue={profile.person.themeColor}
              className="field mt-2 h-12 w-full p-1"
            />
          </label>
          <SubmitButton>Guardar cambios</SubmitButton>
        </form>
      </section>
    </div>
  );
}
