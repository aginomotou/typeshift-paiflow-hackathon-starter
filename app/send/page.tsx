import { publicConfig, lockedPublicConfig } from "@/lib/paiflow";
import { pundarRecipients } from "@/lib/pundar";
import { StarterApp } from "@/components/starter-app";

export const dynamic = "force-dynamic";

export default async function SendPage() {
  const config = publicConfig();
  // Public G-addresses only; the API token never leaves the server.
  return (
    <StarterApp
      config={config}
      recipients={pundarRecipients()}
      locked={lockedPublicConfig()}
    />
  );
}
