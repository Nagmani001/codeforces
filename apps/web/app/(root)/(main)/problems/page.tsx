import { Navbar } from "../../../../components/navbar";
import { cookies } from "next/headers";
import { ProblemsFilters } from "../../../../components/problems-filters";
import { ProblemsTable } from "../../../../components/problems-table";
import { ProblemsSidebar } from "../../../../components/problems-sidebar";
import { getAllTags, getProblems, getUser } from "../../../../lib/utils";
import { Problem } from "../../../../lib/temp";

export default async function ProblemsPage() {
  const cookieStore = await cookies();
  // INFO: Cookies are added explicitly since the server does not forward them to the backend service.
  const problems = await getProblems(cookieStore);
  const tags = await getAllTags();
  let user = undefined;
  try {
    const res = await getUser(cookieStore);
    user = res.data?.user;
  } catch { }
  const actualTags = tags.data.allTags.map((x: any) => x.title);
  const newProblems: Problem[] = problems.data.problems.map((x: any, index: number) => {
    return {
      id: x.id,
      serialNumber: index + 1,
      title: x.title,
      difficulty: x.problemType,
      tags: x.tags.map((y: any) => y.title),
      status: x.submission.length == 0 ? "UNSOLVED" : x.submission[x.submission.length - 1].status
    }
  });


  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Problems
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Sharpen your algorithmic thinking with our curated collection of competitive programming challenges
            </p>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-6">
            <ProblemsFilters allTags={actualTags} />
            <ProblemsTable problems={newProblems} />
          </div>
          <div className="lg:col-span-1">
            <ProblemsSidebar />
          </div>
        </div>
      </main>
    </div>
  )
}
