import { z } from 'zod'

export const voteSchema = z.object({
  votingId: z.uuid(),
  optionId: z.uuid(),
})

export type VoteSchema = z.infer<typeof voteSchema>
