export default function slugify(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}
