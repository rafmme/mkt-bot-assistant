/* eslint-disable no-unsafe-finally */
/* eslint-disable consistent-return */
import puppeteer from 'puppeteer-core';

/**
 * @class
 * @classdesc
 */
export default class Scraper {
  /**
   * @constructor
   * @description
   */
  constructor() {
    if (typeof Scraper.instance === 'object') {
      return Scraper.instance;
    }

    Scraper.instance = this;
    return this;
  }

  /**
   * @static
   * @description
   */
  static async GetInstance() {
    const scraperObject = new this();
    scraperObject.browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });

    return scraperObject;
  }

  /**
   * @static
   * @description
   * @param {*} url
   * @param {} className
   * @returns {String} text
   */
  static async GetElementText(url, className) {
    let hasError = false;

    try {
      const { browser } = await this.GetInstance();
      const page = await browser.newPage();

      await page.goto(url);
      await page.waitForSelector(className);

      const element = await page.$(className);
      const text = await element.evaluate((node) => node.innerText);
      await browser.close();

      return text;
    } catch (error) {
      hasError = true;
      console.error(error);
    } finally {
      if (hasError) {
        hasError = false;
        return `Sorry, I can't process this request at the moment`;
      }
    }
  }
}
