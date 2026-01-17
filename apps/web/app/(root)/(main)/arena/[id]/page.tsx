
import { notFound } from "next/navigation"
import { ArenaLayout } from "../../../../../components/arena/arena-layout"
import { problemDetails } from "../../../../../lib/temp"

export default async function ArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  console.log(id);
  console.log(typeof id);
  const problem = problemDetails[id]
  console.log(problem);
  console.log(typeof problem);

  if (!problem) {
    notFound()
  }

  return <ArenaLayout problem={problem} />
}
