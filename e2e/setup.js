
import {beforeEach, afterEach, afterAll} from 'vitest';
import puppeteer from 'puppeteer';
import * as db from './db'

export let browser;
export let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    // headless: true,
    // slowMo: 2,
    args: ['--window-size=768,1024'],
    defaultViewport: null, 
    /*
     * Uncomment these two settings if you want to see the browser.
     * However, in the grading system e2e test run headless, so make
     * sure they work that way before submitting.
     */
    headless: false,
    slowMo: 10,
  })
  page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
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

beforeEach(async () => {
  await db.reset()
})

afterAll(async () => {
  await db.shutdown()
})

export const clickOn = async (selector) => {
  await Promise.all([
    page.waitForNavigation(),
    page.waitForSelector(selector),
    page.click(selector)
  ])
}

export const clickOnAria = async (label) => {
  await clickOn(`[aria-label="${label}"]`)
}

export const waitForText = async (text) => {
  await page.waitForSelector(`text/${text}`)
}

export const waitForTextToDisapear = async (text) => {
  await page.waitForSelector(`text/${text}`, { hidden: true })
}

export const waitForAria = async (label) => {
  await page.waitForSelector(`[aria-label*="${label}"]`)
}

export const waitForAriaToDisapear = async (label) => {
  await page.waitForSelector(`[aria-label*="${label}"]`, { hidden: true })
}

