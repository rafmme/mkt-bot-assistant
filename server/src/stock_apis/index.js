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
}
