import { verifySession, getTotpSecret } from "@/lib/admin";
import { redirect } from "next/navigation";
import ClientLoginForm from "./ClientLoginForm";

export default async function AdminPage() {
  const isAuth = await verifySession();
  
  if (isAuth) {
    redirect("/admin/dashboard");
  }

  const secret = await getTotpSecret();
  const needsSetup = !secret;

  return <ClientLoginForm needsSetup={needsSetup} />;
}
