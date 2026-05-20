
import {beforeEach, afterEach, afterAll} from 'vitest';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import * as db from './db'

dotenv.config({ path: './Service/Login/.env' })

const loginServiceUrl =
  process.env.LOGIN_SERVICE_URL ?? 'http://localhost:4010/api/v0'

const timeout = 30000

export let browser;
export let page;

beforeEach(async () => {
  await db.reset()
})

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    slowMo: 2,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=768,1024',
    ],
    defaultViewport: null,
    /*
     * Uncomment these two settings if you want to see the browser.
     * However, in the grading system e2e test run headless, so make
     * sure they work that way before submitting.
     */
    // headless: false,
    // slowMo: 10,
  })
  page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout });
})

afterEach(async () => {
  await new Promise(res => setTimeout(res, 1000))
  if (!browser) {
    return
  }
  const childProcess = browser.process();
  if (childProcess) {
    await childProcess.kill(9);
  }
})

afterAll(async () => {
  await db.shutdown()
})

export const clickOn = async (selector) => {
  const clickable = await page.waitForSelector(selector, { timeout });
  await clickable.click();
  clickable.dispose();
}

export const clickOnAria = async (label) => {
  await clickOn(`[aria-label="${label}"]`)
}

export const waitForText = async (text) => {
  await page.waitForSelector(`text/${text}`, { timeout })
}

export const waitForTextToDisapear = async (text) => {
  await page.waitForSelector(`text/${text}`, { hidden: true, timeout })
}

export const waitForAria = async (label) => {
  await page.waitForSelector(`[aria-label*="${label}"]`, { timeout })
}

export const waitForAriaToDisapear = async (label) => {
  await page.waitForSelector(`[aria-label*="${label}"]`, { hidden: true, timeout })
}

export const waitForHomeListings = async () => {
  await waitForText('Hello Guest')
  await page.waitForSelector('[aria-label^="Item Card "]', { timeout })
}

export const openItemByName = async (name) => {
  await waitForText('Hello Guest')

  const homeTitle = await page.$(
    `[aria-label^="Item Card "] h3[aria-label="${name}"]`,
  )
  if (homeTitle) {
    await homeTitle.click()
    homeTitle.dispose()
    await waitForAria(`add ${name} to cart`)
    return
  }

  const searchInput = await page.waitForSelector('[aria-label="Search"]', {
    timeout,
  })
  await searchInput.click()
  await searchInput.type(name)
  searchInput.dispose()
  await clickOnAria('Submit search')
  await waitForAria(`Search Item ${name}`)

  const resultTitle = await page.waitForSelector(
    `[aria-label="Search Item ${name}"] h2[aria-label="${name}"]`,
    { timeout },
  )
  await resultTitle.click()
  resultTitle.dispose()
  await waitForAria(`add ${name} to cart`)
}

export const clickFirstItemNameOnHome = async () => {
  await waitForHomeListings()

  const title = await page.waitForSelector(
    '[aria-label^="Item Card "] h3[aria-label]',
    { timeout },
  )
  const itemName = await title.evaluate(
    (element) => element.getAttribute('aria-label') ?? '',
  )
  await title.click()
  title.dispose()
  await waitForAria(`add ${itemName} to cart`)

  return itemName
}

export async function logInWithMockGoogle() {
  const response = await fetch(`${loginServiceUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({credential: 'e2e-google-token'}),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const authenticated = await response.json()

  const sessionCheck = await fetch(`${loginServiceUrl}/login/check`, {
    headers: {
      Authorization: `Bearer ${authenticated.token}`,
    },
  })

  if (!sessionCheck.ok) {
    throw new Error(`Session check failed: ${sessionCheck.status}`)
  }

  await page.setCookie({
    httpOnly: true,
    name: 'session',
    path: '/',
    sameSite: 'Lax',
    url: 'http://localhost:3000',
    value: authenticated.token,
  })
  await page.evaluate((name) => {
    window.sessionStorage.setItem('name', name)
  }, authenticated.name)
  await page.reload({ waitUntil: 'networkidle2', timeout })

  return authenticated
}

export async function openAccountMenu() {
  await clickOnAria('Open account menu')
}
