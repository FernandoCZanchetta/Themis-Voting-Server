import jwt from 'jsonwebtoken'
import { scrapeJupiterUser } from './scrapper.service'
import { prismaClient } from '@db'

const { JWT_SIGNING_SECRET } = process.env

export async function authFromJupiterWeb(nUSP: string, uniquePassword: string) {
  console.info('[Auth Service] Getting user data...')
  const scrappedUser = await scrapeJupiterUser(nUSP, uniquePassword)

  console.info('[Auth Service] Check course, institute and campus and upsert DB...')
  /* eslint-disable indent */
  await Promise.all([
    scrappedUser.course && scrappedUser.courseCode
      ? prismaClient.course.upsert({
          where: { code: scrappedUser.courseCode },
          update: { name: scrappedUser.course },
          create: { code: scrappedUser.courseCode, name: scrappedUser.course },
        })
      : Promise.resolve(),

    scrappedUser.institute && scrappedUser.instituteCode
      ? prismaClient.institute.upsert({
          where: { code: scrappedUser.instituteCode },
          update: { name: scrappedUser.institute },
          create: { code: scrappedUser.instituteCode, name: scrappedUser.institute },
        })
      : Promise.resolve(),

    scrappedUser.campus
      ? prismaClient.campus.upsert({
          where: { name: scrappedUser.campus },
          update: {},
          create: { name: scrappedUser.campus },
        })
      : Promise.resolve(),
  ])
  /* eslint-enable indent */

  console.info('[Auth Service] Format user info...')
  const userData = {
    course: scrappedUser.course ?? null,
    courseCode: scrappedUser.courseCode ?? null,
    institute: scrappedUser.institute ?? null,
    instituteCode: scrappedUser.instituteCode ?? null,
    campus: scrappedUser.campus ?? null,
  }

  console.info('[Auth Service] Upsert user in DB...')
  await prismaClient.user.upsert({
    where: { nUSPHash: scrappedUser.nUSPHash },
    update: userData,
    create: {
      nUSPHash: scrappedUser.nUSPHash,
      ...userData,
    },
  })

  console.info('[Auth Service] Generate JWT token...')
  const jwtToken = jwt.sign(scrappedUser, JWT_SIGNING_SECRET!, { expiresIn: '30m' })

  return { jwtToken }
}
