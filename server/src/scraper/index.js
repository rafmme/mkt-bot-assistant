/* eslint-disable no-await-in-loop */
/* eslint-disable no-unsafe-finally */
/* eslint-disable consistent-return */
import puppeteer from 'puppeteer';
import MemCachier from '../cache/memcachier';

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
    scraperObject.browser = await puppeteer.launch();

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
        return `Sorry 😔, I can't process this request at the moment.`;
      }
    }
  }

  /**
   * @static
   * @description
   * @returns {[]} news
   */
  static async ScrapeNgNews() {
    let hasError = false;

    try {
      const news = [];
      const { HEROKU_APP_URL } = process.env;
      const { browser } = await this.GetInstance();
      const page = await browser.newPage();

      await page.goto('https://www.abokifx.com/home');
      await page.waitForSelector('.news-section');

      const element = await page.$('.news-section');
      const newsContainerElement = await element.$$('a');

      if (newsContainerElement.length > 0) {
        for (let i = 0; i < newsContainerElement.length; i += 1) {
          const el = newsContainerElement[i];

          news.push({
            title: `${await el.evaluate((node) => node.innerText)}`.slice(0, 80),
            image: `${HEROKU_APP_URL}/static/screenshots/ngn.jpg`,
            url: await el.evaluate((node) => node.getAttribute('href')),
          });
        }
      }

      if (news.length > 0) {
        await MemCachier.SetHashItem('ngNews', news, 3600 * 5);
      }

      await browser.close();
      return news;
    } catch (error) {
      hasError = true;
      console.error(error);
    } finally {
      if (hasError) {
        hasError = false;
        return `Sorry 😔, I can't process this request at the moment.`;
      }
    }
  }
}
