import { redirect } from "next/navigation";

// /write opens the Write group on its first sub-tab.
export default function WriteIndexPage() {
  redirect("/write/free");
}
