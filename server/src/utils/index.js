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
      const { uuid: newsId, title, link: url, summary: subtitle, main_image: mainImg } = response[i];
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
        buttons: createNewsOptionButtons(newsId, url),
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
}
