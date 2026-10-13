import { publicConfig } from "@/lib/paiflow";
import { LoginView } from "@/components/pundar/login-view";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { mode } = publicConfig();
  return <LoginView walletEnabled={mode === "team" || mode === "demo"} />;
}
