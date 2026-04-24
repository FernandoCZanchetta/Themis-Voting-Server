import { z } from 'zod'

export const votingsQuerySchema = z.object({
  status: z.enum(['active', 'upcoming', 'finished']).optional(),
})

export type VotingsQuerySchema = z.infer<typeof votingsQuerySchema>
