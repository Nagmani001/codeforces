import * as z from "zod"
import { CompleteProblems, RelatedProblemsModel } from "./index"

export const VisibleTestCasesModel = z.object({
  id: z.string(),
  input: z.string(),
  output: z.string(),
  problemId: z.string(),
})

export interface CompleteVisibleTestCases extends z.infer<typeof VisibleTestCasesModel> {
  problem: CompleteProblems
}

/**
 * RelatedVisibleTestCasesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedVisibleTestCasesModel: z.ZodSchema<CompleteVisibleTestCases> = z.lazy(() => VisibleTestCasesModel.extend({
  problem: RelatedProblemsModel,
}))
