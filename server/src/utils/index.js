/* eslint-disable consistent-return */
import axios from 'axios';
import dotenv from 'dotenv';
import createNewsOptionButtons from '../fb_messenger/messenger_buttons/newsButtons';

dotenv.config();

/**
 * @class Util
 * @classdesc
 */
export default class Util {
  /**
   * @static
   * @description
   * @param {*} requestObject
   */
  static async MakeHTTPRequest(requestObject) {
    const { method, url, params, data, headers } = requestObject;

    try {
      const response = await axios({
        method,
        url,
        params,
        data,
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @static
   * @description
   * @param {*} response
   */
  static convertAPIResponseToMessengerList(response) {
    const { HEROKU_APP_URL } = process.env;
    const list = [];

    if (response.length < 1) {
      return [];
    }

    for (let i = 0; i < response.length; i += 1) {
      const { uuid: newsId, title, content, link: url, summary: subtitle, main_image: mainImg } = response[i];
      const imageURL = mainImg !== null ? mainImg.resolutions[1].url : `${HEROKU_APP_URL}/static/screenshots/mart_image.jpeg`;

      list.push({
        title: title.slice(0, 80),
        subtitle: `${subtitle.slice(0, 77)}...`,
        image_url: imageURL,
        default_action: {
          type: 'web_url',
          url,
          webview_height_ratio: 'full',
        },
        buttons: createNewsOptionButtons(newsId, url, content),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} entities
   */
  static FormatTickers(entities) {
    let tickers = 'TICKERS: ';
    if (entities.length < 1) {
      return;
    }

    if (entities.length === 1) {
      const { term, label } = entities[0];
      tickers += `${label}<${term.split('TICKER:')[1]}>`;
      return tickers;
    }

    for (let i = 0; i < entities.length; i += 1) {
      const { term, label } = entities[i];
      tickers = i + 1 === entities.length ? `${label}<${term.split('TICKER:')[1]}>` : `${label}<${term.split('TICKER:')[1]}>; `;
    }

    return tickers;
  }

  /**
   * @static
   * @description
   * @param {*} newsList
   * @param {*} newsId
   */
  static FindNewsItem(newsList, newsId) {
    for (let index = 0; index < newsList.length; index += 1) {
      if (newsList[index].uuid === newsId) {
        return newsList[index];
      }
    }
  }

  /**
   * @static
   * @description
   * @param {*} data
   */
  static ParseCryptoPricesData(data) {
    const list = [];
    const cryptosData = Object.values(data);

    for (let i = 0; i < cryptosData.length; i += 1) {
      const {
        name,
        symbol,
        quote: {
          // eslint-disable-next-line camelcase
          USD: { price, volume_24h, percent_change_1h, percent_change_24h, percent_change_7d, market_cap },
        },
      } = cryptosData[i];

      list.push({
        // eslint-disable-next-line camelcase
        title: `${name} ${symbol}\t\tPrice: $ ${this.FormatLargeNumbers(price)}\t\tMKT Cap: ${this.FormatLargeNumbers(market_cap)}`,
        subtitle: `24h Volume: ${this.FormatLargeNumbers(volume_24h)}\n% CHG (1h): ${this.FormatLargeNumbers(percent_change_1h)} %\n% CHG (24h): ${this.FormatLargeNumbers(
          percent_change_24h,
        )} %\n% CHG (7d): ${this.FormatLargeNumbers(percent_change_7d)} %`,
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} number
   */
  static FormatLargeNumbers(number) {
    const n = Number.parseFloat(number);

    if (Number.isNaN(n)) {
      return '-';
    }

    if (n >= 1e3) {
      const units = ['k', 'M', 'B', 'T'];

      const unit = Math.floor((n.toFixed(0).length - 1) / 3) * 3;
      const num = (n / `1e${unit}`).toFixed(2);
      const unitname = units[Math.floor(unit / 3) - 1];
      const formatedNum = num + unitname;

      return formatedNum;
    }

    return n.toLocaleString();
  }

  /**
   * @static
   * @description
   * @param {*} data
   */
  static ParseTrendingTickersData(data) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      const { shortName, regularMarketChangePercent, regularMarketPrice, regularMarketChange, symbol, exchange } = data[i];

      list.push({
        title: `(${symbol})\tPrice: $${regularMarketPrice}\t CHG: $${regularMarketChange}\t% CHG: ${regularMarketChangePercent}`,
        subtitle: `${shortName}\n Exchange: ${exchange}`,
      });
    }

    return list;
  }
}
