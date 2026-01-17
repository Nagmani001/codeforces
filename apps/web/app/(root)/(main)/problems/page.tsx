import { Navbar } from "../../../../components/navbar";
import { ProblemsFilters } from "../../../../components/problems-filters";
import { ProblemsTable } from "../../../../components/problems-table";

export default function ProblemsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground">
            Practice problems to improve your competitive programming skills
          </p>
        </div>
        <ProblemsFilters />
        <ProblemsTable />
      </main>
    </div>
  )
}
