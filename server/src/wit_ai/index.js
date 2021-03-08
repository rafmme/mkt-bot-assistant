/* eslint-disable no-case-declarations */
import { Wit, log } from 'node-wit';
import dotenv from 'dotenv';
import FBGraphAPIRequest from '../fb_messenger/graphapi_requests';
import Menu from '../fb_messenger/messenger_buttons/Menu';
import Util from '../utils';
import RedisCache from '../cache/redis';
import StockAPI from '../stock_apis';

/**
 * @class WitAIHelper
 * @classdesc
 */
export default class WitAIHelper {
  /**
   * @static
   * @description
   * @returns
   */
  static InitializeWitAIObject() {
    dotenv.config();
    const { WIT_TOKEN } = process.env;

    const wit = new Wit({
      accessToken: WIT_TOKEN,
      logger: new log.Logger(log.INFO),
    });

    return wit;
  }

  /**
   * @static
   * @description
   * @param {*} text
   * @param {*} sender
   */
  static async ProcessMessage(text, sender) {
    let err = false;
    const wit = this.InitializeWitAIObject();

    try {
      await this.ProcessResponse(await wit.message(text), sender, text);
    } catch (error) {
      if (error) {
        err = true;
      }

      console.error('Oops! Got an error from Wit: ', error.stack || error);
    } finally {
      if (err === true) {
        await FBGraphAPIRequest.SendTextMessage(sender, `Sorry 😔, I can't process your request now. My home 💻 is currently not in order`);
      }
      err = false;
    }
  }

  /**
   * @static
   * @description
   * @param {*} traits
   */
  static AnalyzeTraits(traits) {
    let confidence = 0;
    let trait;
    let value;

    Object.keys(traits).forEach((key) => {
      if (traits[key][0].confidence > confidence) {
        confidence = traits[key][0].confidence;
        trait = key;
        value = traits[key][0].value;
      }
    });

    return { trait, value };
  }

  /**
   * @static
   * @description
   * @param {*} intent
   */
  static AnalyzeIntent(intent) {
    if (intent.length === 1) {
      return intent[0].name;
    }

    return '';
  }

  /**
   * @static
   * @description
   * @param {*} param
   * @param {*} sender
   * @param {*} text
   */
  static async ProcessResponse({ entities, intents, traits }, sender, text) {
    const intent = this.AnalyzeIntent(intents);
    const { trait, value } = this.AnalyzeTraits(traits);

    switch (intent) {
      case 'greetings':
        if (trait === 'wit$greetings') {
          await FBGraphAPIRequest.SendQuickReplies(sender, 'Hi 👋🏾, how can I be of help? 😎', Menu);
        } else if (trait === 'wit$sentiment') {
          const response = value === 'positive' ? 'Glad I could be of help 🙂.' : 'Hmm.';
          await FBGraphAPIRequest.SendTextMessage(sender, response);
        }
        break;

      case 'check_stock':
      case 'stock_news':
      case 'show_my_portfolio':
      case 'check_stock_price':
      case 'create_portfolio':
      case 'delete_portfolio':
      case 'show_crypto_prices':
      case 'show_crypto_holdings':
      case 'portfolio_news':
      case 'convert_currency':
      case 'check_crypto_coin':
        await FBGraphAPIRequest.SendTextMessage(sender, `Hi, this feature ${intent} isn't available yet, we are still working 👷🏾‍♀️ on it.\nPlease bear with us.`);
        break;
      case 'market_news':
        FBGraphAPIRequest.fetchNews(sender);
        break;

      default:
        await this.UnknownResponseHandler(sender, text);
        break;
    }
  }

  /**
   * @static
   * @description
   * @param {*} sender
   * @param {*} text
   */
  static async UnknownResponseHandler(sender, text) {
    const word = text.toLowerCase().trim().replace('?', '');

    if (word.startsWith('$')) {
      const ticker = word.replace('$', '');
      let quote = await RedisCache.GetItem(`${ticker.toLowerCase()}Quote`);

      if (quote) {
        quote = await StockAPI.GetStockQuote(ticker);
      }
      await FBGraphAPIRequest.SendTextMessage(sender, Util.CreateStockQuoteText(quote, ticker));
      return;
    }

    switch (word) {
      case 'menu':
      case 'show menu':
      case 'help':
        await FBGraphAPIRequest.SendQuickReplies(sender, 'Hi 👋🏾, how can I be of help? 😎', Menu);
        break;

      case 'who are you':
      case 'what are you':
        const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(sender);
        const response = firstName
          ? `Hi ${firstName}, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market\nHow can I be of assistance?`
          : `Hi there, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market\n\nHow can I be of assistance?`;

        await FBGraphAPIRequest.SendQuickReplies(sender, response, Menu);
        break;

      case '👍🏿':
      case '👍':
      case '👍🏽':
      case '👍🏾':
      case '👍🏻':
      case '👍🏼':
        await FBGraphAPIRequest.SendTextMessage(sender, `Glad I could be of help 🙂.\nIf you don't mind, Buy me a coffee 😉`);
        break;

      case 'news':
        FBGraphAPIRequest.fetchNews();
        break;

      default:
        const msg = `Sorry 😕, I don't understand what you are trying to do.\nMaybe try one of the actions below`;
        await FBGraphAPIRequest.SendQuickReplies(sender, msg, Menu);
        break;
    }
  }
}
