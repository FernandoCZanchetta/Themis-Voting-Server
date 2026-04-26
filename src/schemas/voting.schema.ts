import { z } from 'zod'

export const votingsQuerySchema = z.object({
  status: z.enum(['active', 'upcoming', 'finished']).optional(),
})

export const votingsParamsSchema = z.object({
  id: z.uuid(),
})

export type VotingsQuerySchema = z.infer<typeof votingsQuerySchema>
export type VotingsParamsSchema = z.infer<typeof votingsParamsSchema>
