// Function to generate a slug from the title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

export const dateOnly = (dateTime) => {
  // const dateTime = "2025-01-14T01:45:09.000Z";
  const dateOnly = dateTime.split("T")[0];
  return dateOnly;
};

export function slugToTitle(slug) {
  // Replace hyphens with spaces
  let title = slug.replace(/-/g, ' ');
  // Capitalize the first letter of each word
  title = title.replace(/\b\w/g, char => char.toUpperCase());
  return title;
}