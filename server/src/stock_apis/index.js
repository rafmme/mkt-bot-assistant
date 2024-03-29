import axios from 'axios';
import dotenv from 'dotenv';
import MemCachier from '../cache/memcachier';
import Util from '../utils';
import RequestBuilder from '../utils/Request/RequestBuilder';

dotenv.config();

/**
 * @class StockAPI
 * @classdesc
 */
export default class StockAPI {
  /**
   * @static
   * @description
   */
  static async GetGeneralMarketNewsFromYahooFinance() {
    const { X_RAPIDAPI_KEY, X_RAPIDAPI_HOST } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/list')
      .method('GET')
      .queryParams({
        category: 'generalnews',
        region: 'US',
      })
      .headers({
        'x-rapidapi-key': X_RAPIDAPI_KEY,
        'x-rapidapi-host': X_RAPIDAPI_HOST,
        useQueryString: true,
      })
      .build()
      .send();

    const {
      items: { result },
    } = response;

    await MemCachier.SetHashItem('generalnews', result, 3600 * 12);
    return result;
  }

  /**
   * @static
   * @description
   * @param {} coinName
   */
  static async GetCryptoPrices(coinName) {
    const { COIN_MARKET } = process.env;
    const symbol = coinName || 'BTC,ETH,ADA,LTC,XMR,DOT,USDT,BNB,DOGE,XRP';
    const cacheKey = coinName ? `${coinName.toLowerCase()}Price` : 'cryptoPrices';

    const response = await new RequestBuilder()
      .withURL('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest')
      .method('GET')
      .queryParams({
        symbol,
      })
      .headers({
        'X-CMC_PRO_API_KEY': COIN_MARKET,
      })
      .build()
      .send();

    const { data } = response;

    await MemCachier.SetHashItem(cacheKey, data, 120);
    return data;
  }

  /**
   * @static
   * @description
   */
  static async GetTrendingTickers() {
    const { X_RAPIDAPI_KEY, X_RAPIDAPI_HOST } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-trending-tickers')
      .method('GET')
      .queryParams({
        region: 'US',
      })
      .headers({
        'x-rapidapi-key': X_RAPIDAPI_KEY,
        'x-rapidapi-host': X_RAPIDAPI_HOST,
        useQueryString: true,
      })
      .build()
      .send();

    const {
      finance: { result },
    } = response;
    const trendingTickerQuotes = result[0].quotes.filter((quote) => {
      return quote.region === 'US' && quote.market === 'us_market' && (quote.quoteType === 'ETF' || quote.quoteType === 'EQUITY');
    });

    await MemCachier.SetHashItem('trendingTickers', trendingTickerQuotes, 3600 * 6);
    return trendingTickerQuotes;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   * @param {String} fh
   */
  static async GetStockQuote(symbol, fh) {
    const { IEX_CLOUD, FINNHUB } = process.env;

    if (fh) {
      const response = await new RequestBuilder()
        .withURL('https://finnhub.io/api/v1/quote')
        .method('GET')
        .queryParams({
          symbol: symbol.toUpperCase(),
          token: FINNHUB,
        })
        .build()
        .send();

      await MemCachier.SetHashItem(`${symbol.toLowerCase()}FHQuote`, response, 60 * 15);
      return response;
    }

    const response = await new RequestBuilder()
      .withURL(`https://cloud.iexapis.com/stable/stock/${Util.EncodeURL(symbol.toLowerCase())}/batch`)
      .method('GET')
      .queryParams({
        types: 'quote',
        token: IEX_CLOUD,
      })
      .build()
      .send();

    const { quote } = response;

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Quote`, quote, 60 * 15);
    return quote;
  }

  /**
   * @static
   * @description
   */
  static async GetMarketMovers() {
    const { X_RAPIDAPI_KEY, X_RAPIDAPI_HOST } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-movers')
      .method('GET')
      .queryParams({
        region: 'US',
      })
      .headers({
        'x-rapidapi-key': X_RAPIDAPI_KEY,
        'x-rapidapi-host': X_RAPIDAPI_HOST,
        useQueryString: true,
      })
      .build()
      .send();

    const {
      finance: { result },
    } = response;

    const data = [];

    if (result.length >= 1) {
      for (let i = 0; i < result.length; i += 1) {
        const movers = {
          title: `${result[i].title} ${result[i].description}`,
          listOfMovers: [],
        };

        for (let j = 0; j < result[i].quotes.length; j += 1) {
          movers.listOfMovers.push(result[i].quotes[j]);
        }

        data.push(movers);
      }
    }

    await MemCachier.SetHashItem('movers', data, 3600 * 1);
    return data;
  }

  /**
   * @static
   * @description
   * @param {} symbol
   */
  static async GetStockOverview(symbol) {
    const { AV_KEY } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://www.alphavantage.co/query')
      .method('GET')
      .queryParams({
        function: 'OVERVIEW',
        symbol: `${symbol.toLowerCase()}`,
        apikey: AV_KEY,
      })
      .build()
      .send();

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Overview`, response, 60 * 15);
    return response;
  }

  /**
   * @static
   * @description
   * @param {} newsType
   * @param {} symbol
   */
  static async GetOtherNews(newsType, symbol) {
    let cacheKey;
    let url = 'https://finnhub.io/api/v1/news';
    const { FINNHUB, IEX_CLOUD } = process.env;
    let queryObject = {
      token: FINNHUB,
    };

    switch (newsType) {
      case 'forexNews':
        queryObject.category = 'forex';
        cacheKey = newsType;
        break;

      case 'cryptoNews':
        queryObject.category = 'crypto';
        cacheKey = newsType;
        break;

      case 'mergerNews':
        queryObject.category = 'merger';
        cacheKey = newsType;
        break;

      case 'tickerNews':
        url = `https://cloud.iexapis.com/stable/stock/${symbol.toLowerCase()}/batch`;
        queryObject = {
          types: 'news',
          token: IEX_CLOUD,
        };
        cacheKey = `${symbol.toLowerCase()}News`;
        break;

      default:
        break;
    }

    const response = await new RequestBuilder().withURL(url).method('GET').queryParams(queryObject).build().send();

    if (response.news) {
      MemCachier.SetHashItem(cacheKey, response.news, 3600 * 12);
      return response.news;
    }

    await MemCachier.SetHashItem(cacheKey, response, 3600 * 12);
    return response;
  }

  /**
   * @static
   * @description
   * @param {String} keywords
   */
  static async SearchForCompanies(keywords) {
    const { AV_KEY } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://www.alphavantage.co/query')
      .method('GET')
      .queryParams({
        function: 'SYMBOL_SEARCH',
        apikey: AV_KEY,
        keywords,
      })
      .build()
      .send();

    const { bestMatches } = response;
    const matches = bestMatches.filter((match) => {
      return match['4. region'] === 'United States' && match['8. currency'] === 'USD';
    });

    await MemCachier.SetHashItem(`${keywords}`, matches, 86400);
    return matches;
  }

  /**
   * @static
   * @description
   * @param {String} ticker
   */
  static async GetStockAnalysisData(ticker) {
    const { X_RAPIDAPI_KEY, X_RAPIDAPI_HOST } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-analysis')
      .method('GET')
      .queryParams({
        symbol: `${ticker.toUpperCase()}`,
        region: 'US',
      })
      .headers({
        'x-rapidapi-key': X_RAPIDAPI_KEY,
        'x-rapidapi-host': X_RAPIDAPI_HOST,
        useQueryString: true,
      })
      .build()
      .send();

    await MemCachier.SetHashItem(`${ticker.toLowerCase()}`, response, 3600 * 168);
    return response;
  }

  /**
   * @static
   * @description
   * @param {String} from
   * @param {String} to
   */
  static async GetEconomicCalendar(from, to) {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/calendar/economic')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        from,
        to,
      })
      .build()
      .send();

    const { economicCalendar } = response;
    const data = economicCalendar.filter((ec) => {
      return ec.country === 'US' && new Date(ec.time) >= new Date() && (ec.impact.toLowerCase() === 'medium' || ec.impact.toLowerCase() === 'high');
    });

    await MemCachier.SetHashItem('ec_calendar', data, 86400 * 6);
    return data;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   * @param {String} resolution
   */
  static async GetTechnicalIndicator(symbol, resolution) {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/scan/technical-indicator')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        symbol: symbol.toUpperCase(),
        resolution,
      })
      .build()
      .send();

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}${resolution}`, response, 3600 * 2);
    return response;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   */
  static async GetCompanyPeers(symbol) {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/stock/peers')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        symbol: symbol.toUpperCase(),
      })
      .build()
      .send();

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Peers`, response, 3600 * 500);
    return response;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   */
  static async GetSECFilings(symbol) {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/stock/filings')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        symbol,
        from: `${new Date().getFullYear()}-01-01`,
        to: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
      })
      .build()
      .send();

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Filings`, response, 86400 * 8);
    return response;
  }

  /**
   * @static
   * @description
   */
  static async GetIPOCalendar() {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/calendar/ipo')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        from: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
      })
      .build()
      .send();

    const { ipoCalendar } = response;

    await MemCachier.SetHashItem('ipo_calendar', ipoCalendar, 86400 * 5);
    return ipoCalendar;
  }

  /**
   * @static
   * @description
   * @param {String} from
   * @param {String} to
   */
  static async GetEarningsCalendar(from, to) {
    const { FINNHUB } = process.env;
    const response = await new RequestBuilder()
      .withURL('https://finnhub.io/api/v1/calendar/earnings')
      .method('GET')
      .queryParams({
        token: FINNHUB,
        from,
        to,
      })
      .build()
      .send();

    const { earningsCalendar } = response;

    await MemCachier.SetHashItem('er_calendar', earningsCalendar, 86400 * 6);
    return earningsCalendar;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   */
  static async GetStockBalanceSheet(symbol) {
    const { AV_KEY } = process.env;
    const response = await axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol.toUpperCase()}&apikey=${AV_KEY}`);

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Bs`, response.data, 86400 * 7);
    return response.data;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   */
  static async GetStockCashFlow(symbol) {
    const { AV_KEY } = process.env;
    const response = await axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${symbol.toUpperCase()}&apikey=${AV_KEY}`);

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Cf`, response.data, 86400 * 7);
    return response.data;
  }

  /**
   * @static
   * @description
   * @param {String} symbol
   */
  static async GetStockIncomeStatement(symbol) {
    const { AV_KEY } = process.env;
    const response = await axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol.toUpperCase()}&apikey=${AV_KEY}`);

    await MemCachier.SetHashItem(`${symbol.toLowerCase()}Is`, response.data, 86400 * 7);
    return response.data;
  }
}
