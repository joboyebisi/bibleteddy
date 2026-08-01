import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/onboarding/signup?mode=login");
}
