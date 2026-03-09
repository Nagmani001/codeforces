
import { cookies } from "next/headers";
import { CalendarWidget } from "./calendar-widget"
import { ProgressWidget } from "./progress-widget"
import { getProblemStatus } from "../lib/utils";

export async function ProblemsSidebar() {
  const cookieStore = await cookies();
  const problemStats = await getProblemStatus(cookieStore);
  return (
    <div className="space-y-6">
      <CalendarWidget />
      <ProgressWidget easy={problemStats.data.easy} medium={problemStats.data.medium} hard={problemStats.data.hard} />
    </div>
  )
}
