import RoadmapCard from "./RoadmapCard";

export function RoadmapList({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((rm) => (
        <RoadmapCard key={rm.slug} roadmap={rm} />
      ))}
    </div>
  );
}

export default RoadmapCard;
