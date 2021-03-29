/* eslint-disable import/no-cycle */
/* eslint-disable no-case-declarations */
import { Wit, log } from 'node-wit';
import dotenv from 'dotenv';
import FBGraphAPIRequest from '../fb_messenger/graphapi_requests';
import Menu from '../fb_messenger/messenger_buttons/Menu';
import RedisCache from '../cache/redis';
import Scraper from '../scraper';
import Util from '../utils';
import MemCachier from '../cache/memcachier';
import StockAPI from '../stock_apis';
import createStockOptionButtons from '../fb_messenger/messenger_buttons/Menu/us_stock';
import createTechnicalIndicatorOptionButtons from '../fb_messenger/messenger_buttons/technicalIndicatorButton';

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

      case 'stock_news':
        if (text.toLowerCase().startsWith('ng') || text.toLowerCase().startsWith('9ja') || text.toLowerCase().startsWith('naija')) {
          FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_NEWS');
          return;
        }

        if (text.toLowerCase().startsWith('merger')) {
          FBGraphAPIRequest.HandlePostbackPayload(sender, 'MERGER_NEWS');
          return;
        }

        FBGraphAPIRequest.fetchNews(sender, 'tickerNews', text.split(' ')[0].replace('$', ''));
        break;
      case 'check_stock_price':
      case 'check_stock':
        FBGraphAPIRequest.SendStockQuote({ sender, ticker: text.split(' ')[0].replace('$', '') });
        break;
      case 'show_my_portfolio':
      case 'create_portfolio':
      case 'delete_portfolio':
      case 'show_crypto_holdings':
      case 'portfolio_news':
      case 'convert_currency':
        await FBGraphAPIRequest.SendTextMessage(sender, `Hi, this feature ${intent} isn't available yet, we are still working 👷🏾‍♀️ on it.\nPlease bear with us.`);
        break;
      case 'show_crypto_prices':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'SHOW_CRYPTOS_PRICES');
        break;
      case 'check_crypto_coin':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'CRYPTO_PRICE');
        break;
      case 'market_news':
        await FBGraphAPIRequest.fetchNews(sender);
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
    const action = await RedisCache.GetItem(sender);

    if (action && action !== '') {
      await this.QRButtonResponseHandler(sender, action, word);
      return;
    }

    if (word.startsWith('¢')) {
      const input = word.replace('¢', '').split(' ');
      const cryptoSymbol = input[0];

      await this.QRButtonResponseHandler(sender, 'CRYPTO_PRICE', cryptoSymbol);
      return;
    }

    if (word.startsWith('$')) {
      const input = word.replace('$', '').split(' ');
      const ticker = input[0];

      if (input.length > 1) {
        switch (input[1].toLowerCase()) {
          case 'overview':
            await FBGraphAPIRequest.SendStockOverview({ sender, ticker });
            break;
          case 'news':
            await FBGraphAPIRequest.fetchNews(sender, 'tickerNews', ticker);
            break;
          case 'balance':
            break;
          case 'earnings':
            break;
          case 'recommendation':
          case 'recommendations':
            await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'recommendation' });
            break;
          case 'ratings':
          case 'rating':
            await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'ratings' });
            break;
          case 'upgrades':
          case 'upgrade':
            await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'upgrades' });
            break;
          case 'ehistory':
            await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'earnings' });
            break;
          case 'peers':
            await FBGraphAPIRequest.SendCompanyPeers(sender, ticker);
            break;
          case 'indicator':
            await FBGraphAPIRequest.SendQuickReplies(
              sender,
              `Please select $${ticker.toUpperCase()} Technical Indicator Resolution`,
              createTechnicalIndicatorOptionButtons(ticker),
            );
            break;
          case 'filling':
          case 'sec filings':
          case 'filings':
          case 'sec filing':
            await FBGraphAPIRequest.SendStockSECFilings({ sender, ticker });
            break;
          default:
            await FBGraphAPIRequest.SendStockQuote({ sender, ticker });
            break;
        }

        return;
      }

      await FBGraphAPIRequest.SendQuickReplies(sender, `What'd you like to see on $${ticker.toUpperCase()}`, createStockOptionButtons(ticker));
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
      case '😘':
      case '❤️':
      case '🥰':
      case '😍':
        await FBGraphAPIRequest.SendTextMessage(sender, `Glad I could be of help 🙂.\nIf you don't mind, Buy me a coffee 😉`);
        break;

      case 'news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'MARKET_NEWS');
        break;
      case 'crypto prices':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'SHOW_CRYPTOS_PRICES');
        break;
      case 'trending tickers':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'TRENDING_TICKERS');
        break;
      case 'top movers':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'TOP_MOVERS');
        break;
      case 'crypto news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'CRYPTO_NEWS');
        break;
      case 'forex news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'FOREX_NEWS');
        break;
      case 'merger news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'MERGER_NEWS');
        break;
      case 'ticker news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'TICKER_NEWS');
        break;
      case 'crypto price':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'CRYPTO_PRICE');
        break;
      case 'ngn parallel rates':
      case 'ngn black market rates':
      case 'ngn parallel rate':
      case 'ngn black market rate':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_P_RATES');
        break;
      case 'ngn bank rates':
      case 'ngn bank rate':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_BANK_RATES');
        break;
      case 'ngn cbn rates':
      case 'ngn cbn rate':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_CBN_RATES');
        break;
      case '9ja news':
      case 'naija news':
      case 'ng news':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_NEWS');
        break;
      case 'check ng stock':
      case 'show ng stock':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'NGN_STOCK');
        break;
      case 'search':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'SEARCH_COMPANY');
        break;
      case 'holiday':
      case 'holidays':
      case 'upcoming holidays':
      case 'upcoming holiday':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'HOLIDAY');
        break;
      case 'econ calendar':
      case 'economic calender':
      case 'calendar':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'ECON_CALENDAR');
        break;
      case 'ticker peers':
      case 'stock peers':
      case 'peers':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_PEERS');
        break;
      case 'quote':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'TICKER_QUOTE');
        break;
      case 'overview':
        FBGraphAPIRequest.HandlePostbackPayload(sender, 'TICKER_OVERVIEW');
        break;
      case 'recommendation':
      case 'recommendations':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_RECOMMENDATION');
        break;
      case 'ratings':
      case 'rating':
      case 'analyst ratings':
      case 'analyst rating':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_ANALYST_RATINGS');
        break;
      case 'upgrades':
      case 'upgrade':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_UPGRADE');
        break;
      case 'ehistory':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_EARNINGS_HISTORY');
        break;
      case 'indicator':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_TAI');
        break;
      case 'sec filings':
      case 'filings':
      case 'sec filing':
      case 'filing':
        await FBGraphAPIRequest.HandlePostbackPayload(sender, 'STOCK_SEC_FILINGS');
        break;

      default:
        const msg = `Sorry 😕, I don't understand what you are trying to do.\nMaybe try one of the actions below`;
        await FBGraphAPIRequest.SendQuickReplies(sender, msg, Menu);
        break;
    }
  }

  /**
   * @static
   * @description
   * @param {*} sender
   * @param {*} text
   */
  static async QRButtonResponseHandler(sender, action, text) {
    await RedisCache.SetItem(sender, '', 1);
    await RedisCache.DeleteItem(sender);

    const ticker = text.toLowerCase().replace('$', '').replace('¢', '');

    switch (action) {
      case 'TICKER_NEWS':
        await FBGraphAPIRequest.fetchNews(sender, 'tickerNews', ticker);
        break;

      case 'TICKER_QUOTE':
        await FBGraphAPIRequest.SendStockQuote({ sender, ticker });
        break;
      case 'TICKER_OVERVIEW':
        await FBGraphAPIRequest.SendStockOverview({ sender, ticker });
        break;
      case 'STOCK_ANALYST_RATINGS':
        await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'ratings' });
        break;
      case 'STOCK_RECOMMENDATION':
        await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'recommendation' });
        break;
      case 'STOCK_UPGRADE':
        await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'upgrades' });
        break;
      case 'STOCK_EARNINGS_HISTORY':
        await FBGraphAPIRequest.SendStockAnalysis({ sender, ticker, type: 'earnings' });
        break;
      case 'STOCK_PEERS':
        await FBGraphAPIRequest.SendCompanyPeers(sender, ticker);
        break;
      case 'STOCK_TAI':
        await FBGraphAPIRequest.SendQuickReplies(sender, `Please select $${ticker.toUpperCase()} Technical Indicator Resolution`, createTechnicalIndicatorOptionButtons(ticker));
        break;
      case 'STOCK_SEC_FILINGS':
        await FBGraphAPIRequest.SendStockSECFilings({ sender, ticker });
        break;
      case 'CRYPTO_PRICE':
        await FBGraphAPIRequest.SendCryptoPrices(sender, ticker);
        break;
      case 'NGN_STOCK':
        let ngStock = await RedisCache.GetItem(`${ticker}NG`);

        if (!ngStock) {
          const url = `https://www.marketwatch.com/investing/stock/${ticker}?countrycode=ng`;
          const ngStockPrice = await Scraper.GetElementText(url, '.element.element--intraday');
          const ngStockKeyData = await Scraper.GetElementText(url, '.element.element--list');
          ngStock = `${ticker.toUpperCase()} Quote\n\n${ngStockPrice}\n\n${Util.ParseScrapedStockData(ticker, ngStockKeyData)}`;
          await RedisCache.SetItem(`${ticker}NG`, ngStock, 60 * 10);
        }
        await FBGraphAPIRequest.SendLongText({ sender, text: ngStock });
        break;
      case 'SEARCH_COMPANY':
        let matches = await MemCachier.GetHashItem(ticker);

        if (!matches) {
          matches = await StockAPI.SearchForCompanies(ticker);
        }

        if (matches.length === 0 || !matches) {
          await FBGraphAPIRequest.SendTextMessage(sender, `Sorry 😔, no match was found for ${ticker}`);
          return;
        }

        await FBGraphAPIRequest.SendListRequest({ sender, text: `Here's the search result for ${ticker}`, list: Util.ParseCompaniesSearchResultData(matches) });

        break;

      default:
        await FBGraphAPIRequest.SendQuickReplies(sender, 'Hi 👋🏾, how can I be of help? 😎', Menu);
        break;
    }
  }
}
