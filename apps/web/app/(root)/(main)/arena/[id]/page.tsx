import { notFound } from "next/navigation"
import { ArenaLayout } from "../../../../../components/arena/arena-layout"
import { getProblemPrettified, getSpecificProblem } from "../../../../../lib/utils";

export default async function ArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const getProblem = (await getSpecificProblem(id)).data;
  const problem = getProblemPrettified(getProblem);

  if (!problem) {
    notFound()
  }

  return <ArenaLayout problem={problem} />
}

