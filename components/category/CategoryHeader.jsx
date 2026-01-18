export default function CategoryHeader({ category }) {
    return (
        <section className="border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-100">
                    {category.name}
                </h1>

                {category.description && (
                    <p className="mt-2 text-gray-400 max-w-2xl">
                        {category.description}
                    </p>
                )}
            </div>
        </section>
    );
}
