import crypto from 'crypto'
import { chromium } from 'playwright'
import { AuthUser } from '@types'
import { parseCodeAndName } from '@utils'

const loginJupiterLink = 'https://uspdigital.usp.br/jupiterweb/webLogin.jsp'
const hourlyScheduleJupiterSelector = "a[href='gradeHoraria?codmnu=4759']"

export async function scrapeJupiterUser(nUSP: string, uniquePassword: string, retry: number = 0): Promise<AuthUser> {
  if (retry >= 5) {
    console.error('[ERROR] [JupiterWeb Scrapper] Too Many Retries!')
    throw new Error('[ERROR] [JupiterWeb Scrapper] Too Many Retries!')
  }

  const browser = await chromium.launch({ headless: true })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  })

  try {
    console.info('[JupiterWeb Scrapper] Going to login page...')
    await page.goto(loginJupiterLink, { timeout: 15000 })


    console.info('[JupiterWeb Scrapper] Filling nUSP & UniquePassword fields...')
    await page.fill("input[name='codpes']", nUSP)
    await page.fill("input[name='senusu']", uniquePassword)


    console.info('[JupiterWeb Scrapper] ENTER...')
    await page.press("input[name='senusu']", 'Enter')


    console.info('[JupiterWeb Scrapper] Checking possible invalid credentials input...')
    const nUSPError = page.locator('#web_mensagem')
    const uniquePasswordError = page.locator("div:has-text('Usuário / Senha Incorreta!')")

    await page.waitForTimeout(1500)

    if (await nUSPError.count() > 0) {
      const text = await nUSPError.textContent()

      if (text?.includes('sem acesso')) {
        throw new Error('Invalid nUSP!')
      }
    }

    if (await uniquePasswordError.count() > 0) {
      throw new Error('Invalid Unique Password!')
    }


    console.info('[JupiterWeb Scrapper] Wait pages to load...')
    await page.waitForSelector(hourlyScheduleJupiterSelector, { timeout: 7500 })
    await page.click(hourlyScheduleJupiterSelector)


    console.info('[JupiterWeb Scrapper] Wait program selector & options to load...')
    const programSelector = page.locator('select')
    const programOptions = programSelector.locator('option')
    const programCount = await programOptions.count()


    console.info('[JupiterWeb Scrapper] Select most recent program...')
    const lastProgram = await programOptions.nth(programCount - 1).getAttribute('value')
    await programSelector.selectOption(lastProgram)


    console.info('[JupiterWeb Scrapper] Press search button to retrieve information...')
    await page.click("input[type='button'][value='Buscar']")


    console.info('[JupiterWeb Scrapper] Wait for hourly schedule table to load...')
    await page.waitForSelector("tr[id='1']", { timeout: 10000 })


    console.info('[JupiterWeb Scrapper] Wait and get user course and institute...')
    await page.waitForSelector('#curso, #unidade')
    const courseText = await page.textContent('#curso')
    const instituteText = await page.textContent('#unidade')


    console.info('[JupiterWeb Scrapper] Format data...')
    const { code: courseCode, name: course} = parseCodeAndName(courseText ?? undefined)
    const { code: instituteCode, name: institute } = parseCodeAndName(instituteText ?? undefined)


    console.info('[JupiterWeb Scrapper] Check data...')
    if (!course || !courseCode) {
      throw new Error('Invalid Course!')
    }
    if (!institute || !instituteCode) {
      throw new Error('Invalid Institute!')
    }


    console.info('[JupiterWeb Scrapper] Anonymize sensitive data...')
    const nUSPHash = crypto.createHash('sha512').update(nUSP).digest('hex')


    return {
      sub: `user:${nUSPHash}`,
      nUSPHash,
      course,
      courseCode,
      institute,
      instituteCode,
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('Timeout') || err.message.includes('Navigation')) {
        await new Promise(r => setTimeout(r, 1000))
        console.error('[ERROR] [JupiterWeb Scrapper] Login failed or timeouted while trying to scrape JupiterWeb data! [Retry: ' + retry + '] Error: ' + err.message)
        return scrapeJupiterUser(nUSP, uniquePassword, retry + 1)
      }

      if (err.message.includes('nUSP') || err.message.includes('Unique Password')) {
        console.error('[ERROR] [JupiterWeb Scrapper] Login Failed - Invalid Credentials! Error: ' + err.message)
        throw new Error('Login failed - Invalid Credentials! Error: ' + err.message)
      }

      if (err.message.includes('Course!') || err.message.includes('Institute!')) {
        console.error('[ERROR] [JupiterWeb Scrapper] User Generation Failed - Invalid Course/Institue! Error: ' + err.message)
        throw new Error('User Generation Failed - Invalid Course/Institue! Error: ' + err.message)
      }
    }

    console.error('[ERROR] [JupiterWeb Scrapper] Login failed or an error occoured while trying to scrape JupiterWeb data!')
    throw new Error('[ERROR] [JupiterWeb Scrapper] Login failed or an error occoured while trying to scrape JupiterWeb data!')
  } finally {
    await browser.close()
  }
}
