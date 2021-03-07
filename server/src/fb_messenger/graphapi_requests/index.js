/* eslint-disable no-case-declarations */
/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import RequestBuilder from '../../utils/Request/RequestBuilder';
import MessengerTemplateFactory from '../messenger_templates/MessengerTemplateFactory';
import menuButtons from '../messenger_buttons/menu';
import StockAPI from '../../stock_apis';
import Util from '../../utils';
import MemCachier from '../../cache/memcachier';

dotenv.config();
const { FB_PAGE_ACCESS_TOKEN, SEND_API } = process.env;

export default class FBGraphAPIRequest {
  /**
   * @description function that handles creation senders action
   * @param {*} sender FB User's ID
   */
  static async CreateSenderAction(sender) {
    const messageData = 'typing_on';

    await new RequestBuilder()
      .withURL(SEND_API)
      .queryParams({
        access_token: FB_PAGE_ACCESS_TOKEN,
      })
      .method('POST')
      .data({
        recipient: {
          id: sender,
        },
        sender_action: messageData,
      })
      .build()
      .send();
  }

  /**
   * @description
   * @param {*} sender
   */
  static async RetrieveFBUserProfile(sender) {
    const FBUserProfileData = await new RequestBuilder()
      .withURL(`https://graph.facebook.com/${sender}`)
      .queryParams({
        fields: 'first_name,last_name,profile_pic',
        access_token: FB_PAGE_ACCESS_TOKEN,
      })
      .method('GET')
      .build()
      .send();

    return FBUserProfileData;
  }

  /**
   * @description function that handles sending messenger messeages to users
   * @param {*} sender FB User's ID
   * @param {String} text Text to send to FB User
   * @param {} tag
   */
  static async SendTextMessage(sender, text, tag) {
    let data;
    const messageData = {
      text,
    };

    if (tag) {
      data = {
        recipient: {
          id: sender,
        },
        message: messageData,
        messaging_type: 'MESSAGE_TAG',
        tag,
      };
    } else {
      data = {
        recipient: {
          id: sender,
        },
        message: messageData,
      };
    }

    await this.CreateSenderAction(sender);
    await new RequestBuilder()
      .withURL(SEND_API)
      .queryParams({
        access_token: FB_PAGE_ACCESS_TOKEN,
      })
      .method('POST')
      .data(data)
      .build()
      .send();
  }

  /**
   * @description
   * @param {*} sender
   * @params
   */
  static async SendAttachment(sender, { type, imageUrl, templateObject }) {
    let messageData;

    switch (type) {
      case 'image':
        messageData = {
          attachment: {
            type,
            payload: {
              url: imageUrl,
              is_reusable: true,
            },
          },
        };
        break;

      case 'template':
        messageData = {
          attachment: templateObject,
        };
        break;

      default:
        break;
    }

    await this.CreateSenderAction(sender);
    await new RequestBuilder()
      .withURL(SEND_API)
      .method('POST')
      .queryParams({
        access_token: FB_PAGE_ACCESS_TOKEN,
      })
      .data({
        recipient: {
          id: sender,
        },
        message: messageData,
      })
      .build()
      .send();
  }

  /**
   * @description
   * @param {*} sender
   * @param {*} text
   * @param {*} buttons
   */
  static async CreateMessengerButtonOptions(sender, text, buttons) {
    if (buttons.length === 0) {
      throw new Error(`You can't send an empty list of buttons`);
    }

    if (buttons.length === undefined) {
      throw new TypeError('It requires an array of buttons');
    }

    if (buttons.length >= 1 && buttons.length < 4) {
      await this.SendAttachment(sender, {
        type: 'template',
        templateObject: MessengerTemplateFactory.CreateTemplate({ type: 'button', text, buttons }),
      });
      return;
    }

    for (let i = 0; i < buttons.length; i += 3) {
      const listOfButtons = buttons.slice(i, i + 3);

      if (i === 0) {
        await this.SendAttachment(sender, {
          type: 'template',
          templateObject: MessengerTemplateFactory.CreateTemplate({ type: 'button', text, buttons: listOfButtons }),
        });
      } else {
        await this.SendAttachment(sender, {
          type: 'template',
          templateObject: MessengerTemplateFactory.CreateTemplate({ type: 'button', text: 'OR', buttons: listOfButtons }),
        });
      }
    }
  }

  /**
   * @description
   * @param {String} sender
   */
  static async GetStartedGreeting(sender) {
    const { first_name: firstName } = await this.RetrieveFBUserProfile(sender);
    const text = firstName
      ? `Hi ${firstName}, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market`
      : 'Hi there, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market';

    await this.CreateMessengerButtonOptions(sender, text, menuButtons);
  }

  /**
   * @description
   * @param {*} sender
   * @param {*} postbackPayload
   */
  static async HandlePostbackPayload(sender, postbackPayload) {
    const newsId = postbackPayload.split('|')[1];

    switch (postbackPayload.split('|')[0]) {
      case 'GET_STARTED_PAYLOAD':
        this.GetStartedGreeting(sender);
        break;
      case 'MARKET_NEWS':
        this.fetchNews(sender);
        break;
      case 'SHOW_MARKET_NEWS_CONTENT':
        this.SendNews(sender, 'full', newsId);
        break;
      case 'SHOW_MARKET_NEWS_SUMMARY':
        this.SendNews(sender, 'summary', newsId);
        break;
      case 'SHOW_CRYPTOS_PRICES':
        let cryptoPricesData = await MemCachier.GetHashItem('cryptoPrices');

        if (!cryptoPricesData) {
          cryptoPricesData = await StockAPI.GetCryptoPrices();
        }

        this.CreateMessengerListOptions(sender, Util.ParseCryptoPricesData(cryptoPricesData));
        break;
      default:
        break;
    }
  }

  /**
   * @description
   * @param {*} sender
   * @param {*} elements
   */
  static async CreateMessengerListOptions(sender, elements) {
    if (elements.length === 0) {
      throw new Error(`You can't send an empty list`);
    }

    if (elements.length === undefined) {
      throw new TypeError('It requires an array');
    }

    await this.SendAttachment(sender, {
      type: 'template',
      templateObject: MessengerTemplateFactory.CreateTemplate({ type: 'list', elements }),
    });
  }

  /**
   * @description
   * @param {*} sender
   * @param {*} choice
   * @param {*} newsId
   */
  static async SendNews(sender, choice, newsId) {
    const marketNews = await MemCachier.GetHashItem('generalnews');

    if (!marketNews) {
      await this.SendTextMessage(sender, `Sorry 😔, I was unable to fetch the news item.`);
      return;
    }

    const newsItem = Util.FindNewsItem(marketNews, newsId);

    if (newsItem) {
      const { title, link, content, summary, entities } = newsItem;
      const tickers = Util.FormatTickers(entities);
      let news = choice === 'summary' ? `${title.toUpperCase()}\n\n${summary}\n\n${link}` : `${title.toUpperCase()}\n\n${tickers}\n\n${content.replace(/<[^>]+>/g, '')}`;

      if (tickers) {
        news =
          choice === 'summary' ? `${title.toUpperCase()}\n\n${tickers}\n\n${summary}\n\n${link}` : `${title.toUpperCase()}\n\n${tickers}\n\n${content.replace(/<[^>]+>/g, '')}`;
      }

      if (choice === 'full') {
        for (let index = 0; index < news.length; index += 2000) {
          if (index === 0) {
            await this.SendTextMessage(sender, news.slice(0, 2000));
          } else {
            await this.SendTextMessage(sender, news.slice(index, index + 2001));
          }
        }
      }

      await this.SendTextMessage(sender, news);
    } else {
      await this.SendTextMessage(sender, `Sorry 😔, I was unable to fetch the news item.`);
    }
  }

  /**
   * @description
   * @param {String} sender
   * @param {*} newsType
   */
  static async fetchNews(sender, newsType) {
    let marketNews = await MemCachier.GetHashItem('generalnews');

    if (!marketNews) {
      marketNews = await StockAPI.GetGeneralMarketNewsFromYahooFinance();
    }

    const news = Util.convertAPIResponseToMessengerList(marketNews);
    for (let i = 0; i < news.length; i += 10) {
      const newsList = news.slice(i, i + 10);
      this.CreateMessengerListOptions(sender, newsList);
    }
  }
}
