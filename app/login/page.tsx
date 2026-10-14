import { publicConfig } from "@/lib/paiflow";
import { pundarRecipients } from "@/lib/pundar";
import { LoginView } from "@/components/pundar/login-view";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { mode } = publicConfig();
  // Public G-addresses only, used to recognise which family wallet connects.
  return (
    <LoginView
      walletEnabled={mode === "team" || mode === "demo"}
      recipients={pundarRecipients()}
    />
  );
}
