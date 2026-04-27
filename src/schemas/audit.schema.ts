import { z } from 'zod'

export const auditSchema = z.object({
  hash: z.hash('sha512').transform(h => h.toLowerCase()),
  nonce: z
    .string()
    .regex(/^[a-f0-9]{32}$/i, 'Invalid nonce!')
    .transform(n => n.toLowerCase()),
  signature: z.hash('sha512').transform(s => s.toLowerCase()),
})

export type AuditRequestBody = z.infer<typeof auditSchema>
