import { publicConfig } from "@/lib/paiflow";
import { RegisterView } from "@/components/pundar/register-view";
import type { Role } from "@/lib/profile";

export const dynamic = "force-dynamic";
const ROLES: Role[] = ["ofw", "household", "student"];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const { mode } = publicConfig();
  return (
    <RegisterView
      walletEnabled={mode === "team" || mode === "demo"}
      initialRole={ROLES.includes(role as Role) ? (role as Role) : null}
    />
  );
}
