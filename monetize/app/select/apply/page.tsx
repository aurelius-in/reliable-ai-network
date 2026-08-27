import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SelectApplyRedirect() {
  const host = (await headers()).get("host") || "";
  if (host.toLowerCase().includes("rainselect")) {
    redirect("/#apply");
  }
  redirect("/select#apply");
}
