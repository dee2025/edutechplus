import { redirect } from "next/navigation";

export default async function LegacyFollowingPage({ params }) {
  const { slug } = await params;
  redirect(`/${slug}/following`);
}
