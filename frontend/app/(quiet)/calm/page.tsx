import { redirect } from "next/navigation";

// /calm opens the Feel calm group on its first sub-tab.
export default function CalmIndexPage() {
  redirect("/calm/breathe");
}
