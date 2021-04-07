/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
/* eslint-disable no-case-declarations */
/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import RequestBuilder from '../../utils/Request/RequestBuilder';
import MessengerTemplateFactory from '../messenger_templates/MessengerTemplateFactory';
import StockAPI from '../../stock_apis';
import Util from '../../utils';
import MemCachier from '../../cache/memcachier';
import RedisCache from '../../cache/redis';
import Menu from '../messenger_buttons/Menu';
import us from '../messenger_buttons/Menu/us';
import ngn from '../messenger_buttons/Menu/ngn';
import newsOps from '../messenger_buttons/Menu/news';
import Scraper from '../../scraper';
import createStockOptionButtons from '../messenger_buttons/Menu/us_stock';
import WitAIHelper from '../../wit_ai';
import crypto from '../messenger_buttons/Menu/crypto';
import createTechnicalIndicatorOptionButtons from '../messenger_buttons/technicalIndicatorButton';
import createStockFinancialsOptionButtons from '../messenger_buttons/stockFinancialsButton';

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
      ? `Hi ${firstName}, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market\nWhat'd you like to do?`
      : `Hi there, I am 🤖 Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market\nWhat'd you like to do?`;

    await this.SendQuickReplies(sender, text, Menu);
  }

  /**
   * @description
   * @param {*} sender
   * @param {*} postbackPayload
   */
  static async HandlePostbackPayload(sender, postbackPayload) {
    await RedisCache.SetItem(sender, '', 1);
    await RedisCache.DeleteItem(sender);

    const payload = postbackPayload.split('|')[0];
    const data = postbackPayload.split('|')[1];

    if (payload.startsWith('TAI')) {
      await this.SendStockTechnicalIndicator({ sender, ticker: data.split('+')[0], resolution: data.split('+')[1] });
      return;
    }

    switch (payload) {
      case 'GET_STARTED_PAYLOAD':
        this.GetStartedGreeting(sender);
        break;

      case 'MARKET_NEWS':
        await this.fetchNews(sender);
        break;

      case 'SHOW_MARKET_NEWS_CONTENT':
        this.SendNews(sender, 'full', data);
        break;

      case 'SHOW_MARKET_NEWS_SUMMARY':
        this.SendNews(sender, 'summary', data);
        break;

      case 'SHOW_CRYPTOS_PRICES':
        await this.SendCryptoPrices(sender);
        break;

      case 'MENU_LIST':
        await this.SendLongText({
          sender,
          text: `Please Enter the number corresponding to the actions below.\n\n#. Menu\n\n1. Read US Market News\n\n2. Read Nigeria News\n\n3. Crypto News\n\n4. Ticker/Stock News\n\n5. Merger news\n\n6. Forex News\n\n7. Show Cryptos Price List\n\n8. Check CryptoCoin Price\n\n9. Show US Stock Market Top Movers\n\n10. Show US Stock Market Trending Tickers\n\n11. Search for a Company\n\n12. Show US Stock Market Earnings Report for Today\n\n13. Show US Stock Market Earnings Report for this week\n\n14. Show US Stock Market Upcoming IPOs\n\n15. Show US Holidays for the year\n\n16. Show US Economic Calendar\n\n17. Show US Market Stock Quote\n\n18. Show US Market Stock News\n\n19. Show US Market Stock SEC Fillings\n\n20. Show US Market Stock Peers\n\n21. Show US Market Stock Overview\n\n22. Show US Market Stock Financials\n\n23. Show US Market Stock Analyst Ratings\n\n24. Show US Market Stock Recommendation\n\n25. Show US Market Stock Upgrades/Downgrades\n\n26. Show US Market Stock Earnings History\n\n27. Show US Market Stock Technical Analysis Indicator\n\n28. Show Nigeria (NSE) Stock Quote\n\n29. Show Nigerian Naira Parallel Market Rate\n\n30. Show Nigerian Naira Bank/Online Rate\n\n31. Show Nigerian Naira CBN/Official Rate`,
        });
        break;

      case 'DONATE':
        await this.SendLongText({
          sender,
          text:
            'Enjoying Lewis the Assistant? Help me & my creator by donating\n\nBTC: 1PMuSW7354YSKGnxC8ZeM8JqLdSzNjTFGW\n\nETH, USDT: 0xd6a5fca15a95ba5e59783a31f6bf059146192fd5\n\nBank Account: ALAT Wema, 0236962044\n\n Wanna hire my Creator for a job? Reach him via rafmme@gmail.com.',
        });
        break;

      case 'FEEDBACK':
        await this.SendLongText({
          sender,
          text: 'Got any feedback? bug report or wanna request for a new feature? Holla at my Creator via fartim96@gmail.com',
        });
        break;

      case 'MENU_CRYPTO':
        this.SendQuickReplies(sender, `What'd you like to do regarding Cryptos?`, crypto);
        break;

      case 'MENU_US_MARKET':
        this.SendQuickReplies(sender, `What'd you like to do regarding the US Stock Market?`, us);
        break;

      case 'MENU_NGN_UPDATES':
        this.SendQuickReplies(sender, `What'd you like to do regarding the Nigeria Market?`, ngn);
        break;

      case 'MENU_NEWS':
        this.SendQuickReplies(sender, `What news do you want to read?`, newsOps);
        break;

      case 'STOCK_OPS':
        if (data) {
          await this.SendQuickReplies(sender, `What'd you like to see on $${data.toUpperCase()}`, createStockOptionButtons(data));
          return;
        }

        this.SendQuickReplies(sender, `What'd you like to do regarding a US Stock?`, createStockOptionButtons());
        break;

      case 'TRENDING_TICKERS':
        let list = await MemCachier.GetHashItem('trendingTickers');

        if (!list) {
          list = await StockAPI.GetTrendingTickers();
        }
        await this.SendListRequest({ sender, text: `Here's a list of Trending Tickers in the US Stock Market`, list: Util.ParseTrendingTickersData(list) });
        break;

      case 'TOP_MOVERS':
        let moversData = await MemCachier.GetHashItem('movers');

        if (!moversData) {
          moversData = await StockAPI.GetMarketMovers();
        }

        if (moversData) {
          await this.SendTextMessage(sender, `Here's the US Stock Market Top Gainers, Losers and Most Active`);
        }

        for (let i = 0; i < moversData.length; i += 1) {
          await this.SendListRequest({ sender, list: Util.ParseTopMoversData(moversData[i].listOfMovers, moversData[i].title) });
        }
        break;

      case 'CHECK_STOCK':
        await this.SendStockQuote({ sender, ticker: data });
        break;
      case 'STOCK_OVERVIEW':
        await this.SendStockOverview({ sender, ticker: data });
        break;

      case 'CRYPTO_NEWS':
        this.fetchNews(sender, 'cryptoNews');
        break;

      case 'FOREX_NEWS':
        this.fetchNews(sender, 'forexNews');
        break;

      case 'MERGER_NEWS':
        this.fetchNews(sender, 'mergerNews');
        break;

      case 'TICKER_NEWS':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'TICKER_NEWS', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'TICKER_NEWS', 60 * 5);
        break;

      case 'TICKER_QUOTE':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'TICKER_QUOTE', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'TICKER_QUOTE', 60 * 5);
        break;

      case 'TICKER_OVERVIEW':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'TICKER_OVERVIEW', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'TICKER_OVERVIEW', 60 * 5);
        break;

      case 'STOCK_ANALYST_RATINGS':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_ANALYST_RATINGS', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_ANALYST_RATINGS', 60 * 5);
        break;

      case 'STOCK_EARNINGS_HISTORY':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_EARNINGS_HISTORY', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_EARNINGS_HISTORY', 60 * 5);
        break;

      case 'STOCK_UPGRADE':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_UPGRADE', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_UPGRADE', 60 * 5);
        break;

      case 'STOCK_RECOMMENDATION':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_RECOMMENDATION', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_RECOMMENDATION', 60 * 5);
        break;

      case 'STOCK_TAI':
        if (data) {
          await this.SendQuickReplies(sender, `Please select $${data.toUpperCase()} Technical Indicator Resolution`, createTechnicalIndicatorOptionButtons(data));
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_TAI', 60 * 5);
        break;

      case 'SHOW_FINNHUB_NEWS_SUMMARY':
        this.SendFinnHubNewsSummary(sender, data);
        break;

      case 'CRYPTO_PRICE':
        await this.SendTextMessage(sender, `Please enter the Crypto Coin Symbol within the next 5 minutes.\nFor example: $BTC`);
        await RedisCache.SetItem(sender, 'CRYPTO_PRICE', 60 * 5);
        break;

      case 'NGN_P_RATES':
        await this.SendNGNCurrencyRates(sender);
        break;

      case 'NGN_CBN_RATES':
        await this.SendNGNCurrencyRates(sender, 'cbn_rate');
        break;

      case 'NGN_NEWS':
        let ngNews = await MemCachier.GetHashItem('ngNews');

        if (!ngNews) {
          ngNews = await Scraper.ScrapeNgNews();
        }

        await this.SendListRequest({ sender, text: `Here's the Nigeria news update 📰. Enjoy.`, list: Util.ParseNgNews(ngNews) });
        break;

      case 'NGN_STOCK':
        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the NG (NSE) Stock within the next 5 minutes.\nFor example: $UPDCREIT`);
        await RedisCache.SetItem(sender, 'NGN_STOCK', 60 * 5);
        break;

      case 'NGN_BANK_RATES':
        await this.SendNGNCurrencyRates(sender, 'bank_rate');
        break;

      case 'SHOW_NG_NEWS_SUMMARY':
        let newsContent = await RedisCache.GetItem(data);

        if (!newsContent) {
          newsContent = await Scraper.GetElementText(data, '.main-inner');
          await RedisCache.SetItem(data, newsContent.replace('MARKET NEWS', '').replace('ADVERTISEMENT', '').replace('\n', ''), 3600 * 5);
        }

        await this.SendLongText({ sender, text: newsContent.replace('MARKET NEWS', '').replace('ADVERTISEMENT', '').replace('\n', '') });
        break;

      case 'MARKET_FUTURES':
      case 'MARKET_INDICES':
        let indices = await RedisCache.GetItem('indices');

        if (!indices) {
          indices = await Scraper.GetElementText('https://www.marketwatch.com/investing/stock/aapl', '.markets__table');
          await RedisCache.SetItem('indices', indices, 60 * 5);
        }

        await this.SendLongText({ sender, text: indices });
        break;

      case 'SEARCH_COMPANY':
        await this.SendTextMessage(sender, `Please enter the search keywords within the next 5 minutes.\nFor example: fisker`);
        await RedisCache.SetItem(sender, 'SEARCH_COMPANY', 60 * 5);
        break;

      case 'HOLIDAY':
        const holidays = await MemCachier.GetHashItem('holidays');

        if (holidays) {
          await this.SendLongText({ sender, text: Util.GetUpcomingHolidays(holidays) });
          return;
        }

        await this.SendTextMessage(sender, `Sorry 😔, I'm unable to complete this request.`);
        break;

      case 'STOCK_PEERS':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_PEERS', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_PEERS', 60 * 5);
        break;

      case 'STOCK_SEC_FILINGS':
        if (data) {
          await WitAIHelper.QRButtonResponseHandler(sender, 'STOCK_SEC_FILINGS', data);
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_SEC_FILINGS', 60 * 5);
        break;

      case 'ECON_CALENDAR':
        await this.SendEconomicCalendar(sender);
        break;

      case 'IPO':
        await this.SendIPOCalendar(sender);
        break;

      case 'STOCK_FINANCIALS':
        if (data) {
          await this.SendQuickReplies(sender, `Please select which $${data.toUpperCase()} Financials you want to view.`, createStockFinancialsOptionButtons(data));
          return;
        }

        await this.SendTextMessage(sender, `Please enter the Ticker/Symbol of the Stock within the next 5 minutes.\nFor example: $AAPL`);
        await RedisCache.SetItem(sender, 'STOCK_FINANCIALS', 60 * 5);
        break;

      case 'STOCK_BALANCE_SHEET_A':
        await this.SendStockFinancials({ sender, ticker: data, type: 'abs' });
        break;

      case 'STOCK_BALANCE_SHEET_Q':
        await this.SendStockFinancials({ sender, ticker: data, type: 'qbs' });
        break;

      case 'STOCK_CASH_FLOW_A':
        await this.SendStockFinancials({ sender, ticker: data, type: 'acf' });
        break;

      case 'STOCK_CASH_FLOW_Q':
        await this.SendStockFinancials({ sender, ticker: data, type: 'qcf' });
        break;

      case 'STOCK_INCOME_A':
        await this.SendStockFinancials({ sender, ticker: data, type: 'ais' });
        break;

      case 'STOCK_INCOME_Q':
        await this.SendStockFinancials({ sender, ticker: data, type: 'qis' });
        break;

      case 'EARNINGS_TODAY':
        await this.SendEarningsCalendar(sender, true);
        break;

      case 'EARNINGS_WEEK':
        await this.SendEarningsCalendar(sender);
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
        await this.SendLongText({ sender, text: news });
        return;
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
   * @param {} ticker
   */
  static async fetchNews(sender, newsType, ticker) {
    let finnhubNews;
    switch (newsType) {
      case 'forexNews':
        finnhubNews = await MemCachier.GetHashItem(newsType);

        if (!finnhubNews) {
          finnhubNews = await StockAPI.GetOtherNews(newsType);
        }

        const forexNews = Util.ParseFinnHubNewsData(finnhubNews, 'forex');
        this.SendListRequest({ sender, text: `Here's the Forex Market 📰 news update.`, list: forexNews });
        break;

      case 'cryptoNews':
        finnhubNews = await MemCachier.GetHashItem(newsType);

        if (!finnhubNews) {
          finnhubNews = await StockAPI.GetOtherNews(newsType);
        }

        const cryptoNews = Util.ParseFinnHubNewsData(finnhubNews, 'crypto');
        await this.SendListRequest({ sender, text: `Here's the Crypto Market 📰 news update.`, list: cryptoNews });
        break;

      case 'mergerNews':
        finnhubNews = await MemCachier.GetHashItem(newsType);

        if (!finnhubNews) {
          finnhubNews = await StockAPI.GetOtherNews(newsType);
        }

        const mergerNews = Util.ParseFinnHubNewsData(finnhubNews, 'merger');
        await this.SendListRequest({ sender, text: `Here's the US Stock Market Merger 📰 news update.`, list: mergerNews });
        break;

      case 'tickerNews':
        finnhubNews = await MemCachier.GetHashItem(`${ticker.toLowerCase()}News`);

        if (!finnhubNews) {
          finnhubNews = await StockAPI.GetOtherNews(newsType, ticker);
        }

        const tickerNews = Util.ParseFinnHubNewsData(finnhubNews, `${ticker.toLowerCase()}`);
        await this.SendListRequest({ sender, text: `Here's the ${ticker.toUpperCase()} 📰 news update.`, list: tickerNews });
        break;

      case 'ngNews':
        break;

      default:
        let marketNews = await MemCachier.GetHashItem('generalnews');

        if (!marketNews) {
          marketNews = await StockAPI.GetGeneralMarketNewsFromYahooFinance();
        }

        const news = Util.convertAPIResponseToMessengerList(marketNews);
        this.SendListRequest({ sender, text: `Here's the US Stock Market 📰 news update.`, list: news });
        break;
    }
  }

  /**
   * @description function that handles sending messenger quick replies to users
   * @param {*} sender FB User's ID
   * @param {String} text Text to send to FB User
   * @param {} quickReplies
   */
  static async SendQuickReplies(sender, text, quickReplies) {
    const messageData = {
      text,
      quick_replies: quickReplies,
    };

    await this.CreateSenderAction(sender);
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
        message: messageData,
        messaging_type: 'RESPONSE',
      })
      .build()
      .send();
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendLargeMessengerList({ sender, text, list }) {
    if (text) {
      await this.SendTextMessage(sender, text);
    }

    for (let i = 0; i < list.length; i += 10) {
      const newsList = list.slice(i, i + 10);
      this.CreateMessengerListOptions(sender, newsList);
    }
  }

  /**
   * @description
   * @param {{}} object
   */
  static async SendListRequest({ sender, text, list }) {
    await this.SendLargeMessengerList({ sender, text, list });
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendLongText({ sender, text }) {
    for (let index = 0; index < text.length; index += 2000) {
      if (index === 0) {
        await this.SendTextMessage(sender, text.slice(0, 2000));
      } else {
        await this.SendTextMessage(sender, text.slice(index, index + 2000));
      }
    }
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockQuote({ sender, ticker }, fh) {
    if (fh) {
      let quote = await MemCachier.GetHashItem(`${ticker.toLowerCase()}FHQuote`);

      if (!quote) {
        quote = await StockAPI.GetStockQuote(ticker, 'fh');
      }

      await this.SendTextMessage(sender, Util.CreateStockQuoteText(quote, ticker, 'fh'));
      return;
    }

    let quote = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Quote`);

    if (!quote) {
      quote = await StockAPI.GetStockQuote(ticker);
    }

    await this.SendTextMessage(sender, Util.CreateStockQuoteText(quote, ticker));
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockOverview({ sender, ticker }) {
    let overview = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Overview`);

    if (!overview) {
      overview = await StockAPI.GetStockOverview(ticker);
    }

    const data = Util.ParseStockOverviewData(overview, ticker);
    const { first, second, third, fourth, fifth } = data;

    if (typeof data === 'string') {
      await this.SendTextMessage(sender, data);
      return;
    }

    await this.SendLongText({ sender, text: first });
    await this.SendTextMessage(sender, second);
    await this.SendTextMessage(sender, third);
    await this.SendTextMessage(sender, fourth);
    await this.SendTextMessage(sender, fifth);
  }

  /**
   * @description
   * @param {} sender
   * @param {*} data
   */
  static async SendFinnHubNewsSummary(sender, data) {
    const ticker = data.split('+')[0].toLowerCase();
    const url = data.split('+')[1];

    let finnhubNews;

    switch (ticker) {
      case 'forex':
        finnhubNews = await MemCachier.GetHashItem('forexNews');
        break;

      case 'crypto':
        finnhubNews = await MemCachier.GetHashItem('cryptoNews');
        break;

      default:
        finnhubNews = await MemCachier.GetHashItem(`${ticker}News`);
        break;
    }

    if (!finnhubNews) {
      await this.SendTextMessage(sender, `Sorry 😔, I was unable to fetch the news item.`);
      return;
    }

    const newsItem = Util.FindNewsItem(finnhubNews, url);

    if (newsItem) {
      const { headline, url: link, summary, datetime, related, source } = newsItem;
      const news = `${headline.toUpperCase()}\n\n${summary}\n\nRelated: ${related}\nSource: ${source}\n${link}\n${new Date(datetime).toDateString()}`;
      await this.SendLongText({ sender, text: news });
    } else {
      await this.SendTextMessage(sender, `Sorry 😔, I was unable to fetch the news item.`);
    }
  }

  /**
   * @description
   * @param {} sender
   * @param {*} coinName
   */
  static async SendCryptoPrices(sender, coinName) {
    let cryptoPricesData = coinName ? await MemCachier.GetHashItem(`${coinName.toLowerCase()}Price`) : await MemCachier.GetHashItem('cryptoPrices');
    const text = coinName ? `Here's the price of ${coinName.toUpperCase()}` : `Here's the list of Crytocurrencies with their price.`;

    if (!cryptoPricesData) {
      cryptoPricesData = coinName ? await StockAPI.GetCryptoPrices(coinName) : await StockAPI.GetCryptoPrices();
    }

    await this.SendListRequest({ sender, text, list: Util.ParseCryptoPricesData(cryptoPricesData) });
  }

  /**
   * @description
   * @param {} sender
   * @param {*} type
   */
  static async SendNGNCurrencyRates(sender, type) {
    const url = 'https://www.abokifx.com/home';
    let ratesData;

    switch (type) {
      case 'cbn_rate':
        ratesData = await Scraper.GetElementText(url, '.rate-table-container.cbn-rate');
        break;

      case 'bank_rate':
        ratesData = await Scraper.GetElementText(url, '.bank-atm.conatiner');
        break;

      default:
        ratesData = await Scraper.GetElementText(url, '.grid-table');
        break;
    }

    if (ratesData === `Sorry, I can't process this request at the moment`) {
      await this.SendTextMessage(sender, ratesData);
      return;
    }

    await this.SendLongText({ sender, text: Util.ParseNGNRatesData(ratesData.split('\n\n'), type) });
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockAnalysis({ sender, ticker, type }) {
    let text = '';
    let analysisData = await MemCachier.GetHashItem(`${ticker.toLowerCase()}`);

    if (!analysisData) {
      analysisData = await StockAPI.GetStockAnalysisData(ticker);
    }

    switch (type) {
      case 'ratings':
        text = Util.CreateStockAnalysisText(analysisData, ticker, 'ratings');
        break;

      case 'recommendation':
        text = Util.CreateStockAnalysisText(analysisData, ticker, 'recommendation');
        break;

      case 'upgrades':
        text = Util.CreateStockAnalysisText(analysisData, ticker, 'upgrades');
        break;

      case 'earnings':
        text = Util.CreateStockAnalysisText(analysisData, ticker, 'earnings');
        break;

      default:
        break;
    }

    await this.SendLongText({ sender, text });
  }

  /**
   * @description
   * @param {String} sender
   */
  static async SendEconomicCalendar(sender) {
    let data = await MemCachier.GetHashItem('ec_calendar');

    if (!data) {
      data = await StockAPI.GetEconomicCalendar();
    }

    await this.SendLongText({ sender, text: Util.CreateEconomicCalendarText(data) });
  }

  /**
   * @description
   * @param {String} sender
   * @param {String} symbol
   */
  static async SendCompanyPeers(sender, symbol) {
    let data = await MemCachier.GetHashItem(`${symbol.toLowerCase()}Peers`);

    if (!data) {
      data = await StockAPI.GetCompanyPeers(symbol);
    }

    await this.SendListRequest({ sender, text: `Here's ${symbol.toUpperCase()} peers`, list: Util.ParsePeersData(data) });
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockTechnicalIndicator({ sender, ticker, resolution }) {
    let data = await MemCachier.GetHashItem(`${ticker.toLowerCase()}${resolution}`);

    if (!data) {
      data = await StockAPI.GetTechnicalIndicator(ticker, resolution);
    }

    const text = Util.CreateTechnicalIndicatorText(data, ticker, resolution);

    await this.SendLongText({ sender, text });
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockSECFilings({ sender, ticker }) {
    let data = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Filings`);

    if (!data) {
      data = await StockAPI.GetSECFilings(ticker);
    }

    const text = Util.CreateSECFilingsText(data, ticker);

    await this.SendLongText({ sender, text });
  }

  /**
   * @description
   * @param {String} sender
   */
  static async SendIPOCalendar(sender) {
    let data = await MemCachier.GetHashItem('ipo_calendar');

    if (!data) {
      data = await StockAPI.GetIPOCalendar();
    }

    await this.SendListRequest({ sender, text: 'Upcoming IPOs', list: Util.ParseIPOCalendarData(data) });
  }

  /**
   * @description
   * @param {String} sender
   * @param {Boolean} today
   * @param {String} text
   */
  static async SendEarningsCalendar(sender, today, text) {
    let data = await MemCachier.GetHashItem('er_calendar');

    if (!data) {
      data = await StockAPI.GetEarningsCalendar();
    }

    let word = text || `Here's the upcoming earnings report for this week.`;
    word = today ? `Here's the earnings report for today.` : word;
    const earnings = today ? Util.ParseEarningsCalendarData(data, today) : Util.ParseEarningsCalendarData(data);

    if (typeof earnings === 'string') {
      await this.SendTextMessage(sender, earnings);
      return;
    }

    await this.SendListRequest({ sender, text: word, list: earnings });
  }

  /**
   * @description
   * @param {*} object
   */
  static async SendStockFinancials({ sender, ticker, type }) {
    switch (type) {
      case 'abs':
        let abs = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Bs`);

        if (!abs) {
          abs = await StockAPI.GetStockFinancials(ticker, 'bs');
        }

        await this.SendLongText({ sender, text: Util.ParseStockBalanceSheetData(abs) });
        break;

      case 'qbs':
        let qbs = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Bs`);

        if (!qbs) {
          qbs = await StockAPI.GetStockFinancials(ticker, 'bs');
        }

        await this.SendLongText({ sender, text: Util.ParseStockBalanceSheetData(qbs, 'q') });
        break;

      case 'acf':
        let acf = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Cf`);

        if (!acf) {
          acf = await StockAPI.GetStockFinancials(ticker, 'cf');
        }

        await this.SendLongText({ sender, text: Util.ParseStockCashFlowData(acf) });
        break;

      case 'qcf':
        let qcf = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Cf`);

        if (!qcf) {
          qcf = await StockAPI.GetStockFinancials(ticker, 'cf');
        }

        await this.SendLongText({ sender, text: Util.ParseStockCashFlowData(qcf, 'q') });
        break;

      case 'ais':
        let ais = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Is`);

        if (!ais) {
          ais = await StockAPI.GetStockFinancials(ticker, 'is');
        }

        await this.SendLongText({ sender, text: Util.ParseStockIncomeStatementData(ais) });
        break;

      case 'qis':
        let qis = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Is`);

        if (!qis) {
          qis = await StockAPI.GetStockFinancials(ticker, 'is');
        }

        await this.SendLongText({ sender, text: Util.ParseStockIncomeStatementData(qis, 'q') });
        break;

      default:
        break;
    }
  }
}
