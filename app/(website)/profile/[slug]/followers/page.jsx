import { redirect } from "next/navigation";

export default async function LegacyFollowersPage({ params }) {
  const { slug } = await params;
  redirect(`/${slug}/followers`);
}
