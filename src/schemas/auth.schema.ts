import { z } from 'zod'

export const loginSchema = z.object({
  nUSP: z.string().min(1),
  uniquePassword: z.string().min(1),
})

export type LoginRequestBody = z.infer<typeof loginSchema>
