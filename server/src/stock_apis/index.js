import dotenv from 'dotenv';
import MemCachier from '../cache/memcachier';
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
   * @param {} symbol
   */
  static async GetStockQuote(symbol) {
    const { IEX_CLOUD } = process.env;
    const response = await new RequestBuilder()
      .withURL(`https://cloud.iexapis.com/stable/stock/${symbol.toLowerCase()}/batch`)
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
}
