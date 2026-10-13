import { publicConfig } from "@/lib/paiflow";
import { pundarRecipients } from "@/lib/pundar";
import { FamilyView } from "@/components/pundar/family-view";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  return <FamilyView config={publicConfig()} recipients={pundarRecipients()} />;
}
