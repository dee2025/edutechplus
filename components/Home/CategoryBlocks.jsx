import Link from "next/link";

const categories = [
  { name: "AI & ML", path: "/ai" },
  { name: "Programming", path: "/programming" },
  { name: "Gadgets", path: "/gadgets" },
  { name: "Startups", path: "/startups" },
  { name: "Cybersecurity", path: "/cyber-security" },
  { name: "EdTech", path: "/edtech" },
];

export default function CategoryBlocks() {
  return (
    <section className="bg-white dark:bg-[#0b0f19] py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.path}
            className="p-6 rounded-xl bg-gray-50 dark:bg-[#111827] text-center font-semibold text-gray-900 dark:text-gray-200 hover:bg-cyan-400 hover:text-black transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
