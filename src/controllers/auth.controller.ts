import { Request, Response } from 'express'
import { loginSchema } from '@schemas'
import { authFromJupiterWeb } from '@services'

export async function login(req: Request, res: Response) {
  try {
    console.info('[Auth Controller] Parsing request body...')
    const validatedBody = loginSchema.safeParse(req.body)

    if (!validatedBody.success) {
      console.error('[ERROR] [Auth Controller] Invalid credentials format arrived!')
      return res.status(400).json({ error: 'Invalid credentials format!' })
    }

    console.info('[Auth Controller] Extracting data from the validated request body...')
    const { nUSP, uniquePassword } = validatedBody.data

    console.info('[Auth Controller] Starting JupiterWeb authentication and waiting for JWT...')
    const result = await authFromJupiterWeb(nUSP, uniquePassword)

    console.info('[Auth Controller] Sending JWT to the user...')
    return res.status(200).json(result)
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('Invalid nUSP')) {
        console.error('[ERROR] [Auth Controller] ' + err.message)
        return res.status(400).json({ error: 'Login Failed', cause: 'Invalid nUSP!'})
      } else if (err.message.includes('Invalid Unique Password')) {
        console.error('[ERROR] [Auth Controller] ' + err.message)
        return res.status(400).json({ error: 'Login Failed', cause: 'Invalid Unique Password!'})
      } else if (err.message.includes('Invalid Course')) {
        console.error('[ERROR] [Auth Controller] ' + err.message)
        return res.status(400).json({ error: 'User Generation Failed', cause: 'Invalid Course!'})
      } else if (err.message.includes('Invalid Institute')) {
        console.error('[ERROR] [Auth Controller] ' + err.message)
        return res.status(400).json({ error: 'User Generation Failed', cause: 'Invalid Institute!'})
      }

      console.error('[ERROR] [Auth Controller] Failed To Login!' + err.message)
      return res.status(500).json({ error: 'Login Failed', cause: 'Unexpected Error During Login, Try Again Later!' })
    }

    console.error('[ERROR] [Auth Controller] Failed To Login! Unknown error type!')
    return res.status(500).json({ error: 'Login Failed', cause: 'Unknown error type! Try again later or contact us!' })
  }
}
