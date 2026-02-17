import { redirect } from "next/navigation";

export default async function LegacyProfilePage({ params }) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
