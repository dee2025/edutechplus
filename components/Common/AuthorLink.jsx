import Link from "next/link";

/**
 * AuthorLink Component
 * Renders author name as a clickable link to their profile
 * Prefers username, falls back to user_slug, then ID
 */
export default function AuthorLink({ user, className = "" }) {
  if (!user) return null;

  const { name, username, slug, id } = user;

  // Prefer username (new method), then user_slug, then ID
  const profilePath = username
    ? `/${username}`
    : slug
      ? `/${slug}`
      : id
        ? `/${id}`
        : null;

  if (!profilePath) {
    // Fallback to plain text if no identifier available
    return <span className={className}>{name}</span>;
  }

  return (
    <Link
      href={profilePath}
      className={`font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      {name}
    </Link>
  );
}
