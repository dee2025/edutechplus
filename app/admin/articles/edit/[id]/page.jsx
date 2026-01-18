import EditArticlePage from "./EditPage";

export default async function page({ params }) {
  const param = await params;
  const id = param.id;
  return <EditArticlePage id={id} />;
}
