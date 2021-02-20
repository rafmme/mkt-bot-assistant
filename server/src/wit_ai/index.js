/* eslint-disable no-case-declarations */
import { Wit, log } from 'node-wit';
import dotenv from 'dotenv';
import FBGraphAPIRequest from '../fb_messenger/graphapi_requests';
import menuButtons from '../fb_messenger/messenger_buttons/menu';

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
          await FBGraphAPIRequest.CreateMessengerButtonOptions(sender, 'Hi 👋🏾, how can I be of help? 😎', menuButtons);
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
        const msg = `Sorry 😕, I don't understand ${intent} what you are trying to do.`;
        await FBGraphAPIRequest.CreateMessengerButtonOptions(sender, msg, menuButtons);
        break;
    }
  }
}
