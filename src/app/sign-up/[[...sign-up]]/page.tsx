import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/onboarding");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <SignUp forceRedirectUrl="/onboarding" />
    </div>
  );
}
