import { z } from 'zod'

export const voteBodySchema = z.object({
  optionId: z.uuid(),
})

export const voteParamsSchema = z.object({
  votingId: z.uuid(),
})

export type VoteBodySchema = z.infer<typeof voteBodySchema>
export type VoteParamsSchema = z.infer<typeof voteParamsSchema>
