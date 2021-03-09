/* eslint-disable consistent-return */
import axios from 'axios';
import dotenv from 'dotenv';
import createNewsOptionButtons from '../fb_messenger/messenger_buttons/newsButtons';
import createTickerOptionButtons from '../fb_messenger/messenger_buttons/tickerButton';

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
        title: `${symbol}\tPrice: $${regularMarketPrice}\tCHG: $${regularMarketChange}\t% CHG: ${regularMarketChangePercent}`,
        subtitle: `${shortName}\n Exchange: ${exchange}`,
        buttons: createTickerOptionButtons(symbol),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {} symbol
   */
  static CreateStockQuoteText(data, symbol) {
    const {
      companyName,
      peRatio,
      latestPrice,
      latestTime,
      previousClose,
      previousVolume,
      change,
      changePercent,
      avgTotalVolume,
      marketCap,
      week52High,
      week52Low,
      ytdChange,
    } = data;

    const text = `*** ${companyName} (${symbol.toUpperCase()}) Stock Quote ***\n\nMarket Cap: $ ${this.FormatLargeNumbers(
      marketCap,
    )}\nPrevious Close: $ ${previousClose}\nPrevious Volume: ${this.FormatLargeNumbers(previousVolume)}\nAverage Total Volume: ${this.FormatLargeNumbers(
      avgTotalVolume,
    )}\nP/E Ratio: ${peRatio}\nPrice: $ ${latestPrice}\nPrice Change: $ ${change}\nPercent Change: ${changePercent} %\n52 Week High: $ ${week52High}\n52 Week Low: $ ${week52Low}\nYTD: ${this.FormatLargeNumbers(
      ytdChange,
    )}\nTime: ${latestTime}\n\n ** 15 minutes delayed quote **`;
    return text;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {string} text
   */
  static ParseTopMoversData(data, text) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      const { fullExchangeName, symbol } = data[i];

      list.push({
        title: `${symbol}`,
        subtitle: `Exchange: ${fullExchangeName}\n
        ${text.split('-'[0].trim())}
        `,
        buttons: createTickerOptionButtons(symbol),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {} ticker
   */
  static ParseStockOverviewData(data, ticker) {
    const {
      Symbol: stockTicker,
      AssetType,
      Name,
      Description,
      Exchange,
      Currency,
      Country,
      Sector,
      Industry,
      Address,
      FullTimeEmployees,
      FiscalYearEnd,
      LatestQuarter,
      MarketCapitalization,
      EBITDA,
      PERatio,
      PEGRatio,
      BookValue,
      DividendPerShare,
      DividendYield,
      EPS,
      RevenuePerShareTTM,
      ProfitMargin,
      OperatingMarginTTM,
      ReturnOnAssetsTTM,
      ReturnOnEquityTTM,
      RevenueTTM,
      GrossProfitTTM,
      DilutedEPSTTM,
      QuarterlyEarningsGrowthYOY,
      QuarterlyRevenueGrowthYOY,
      AnalystTargetPrice,
      TrailingPE,
      ForwardPE,
      PriceToSalesRatioTTM,
      PriceToBookRatio,
      EVToRevenue,
      EVToEBITDA,
      Beta,
      SharesOutstanding,
      SharesFloat,
      SharesShort,
      SharesShortPriorMonth,
      ShortRatio,
      ShortPercentOutstanding,
      ShortPercentFloat,
      PercentInsiders,
      PercentInstitutions,
      ForwardAnnualDividendRate,
      ForwardAnnualDividendYield,
      PayoutRatio,
      DividendDate,
      ExDividendDate,
      LastSplitFactor,
      LastSplitDate,
    } = data;

    const overviewData = {
      first: `*** ${stockTicker} Overview ***\n\nAssetType: ${AssetType}\n
      Name: ${Name}\n
      Description: ${Description}`,

      second: `Exchange: ${Exchange}\n
      Currency: ${Currency}\n
      Country: ${Country}\n
      Sector: ${Sector}\n
      Industry: ${Industry}\n
      Address: ${Address}\n
      FullTimeEmployees: ${FullTimeEmployees}\n
      FiscalYearEnd: ${FiscalYearEnd}\n
      LatestQuarter: ${LatestQuarter}\n
      MarketCapitalization: ${this.FormatLargeNumbers(MarketCapitalization)}\n
      EBITDA: ${this.FormatLargeNumbers(EBITDA)}\n
      PERatio: ${PERatio}\n
      PEGRatio: ${PEGRatio}\n
      BookValue: ${BookValue}\n
      DividendPerShare: ${DividendPerShare}\n
      DividendYield: ${DividendYield}\n
      EPS: ${EPS}
`,

      third: `
      RevenuePerShareTTM: ${RevenuePerShareTTM}\n
      ProfitMargin: ${ProfitMargin}\n
      OperatingMarginTTM: ${OperatingMarginTTM}\n
      ReturnOnAssetsTTM: ${ReturnOnAssetsTTM}\n
      ReturnOnEquityTTM: ${ReturnOnEquityTTM}\n
      RevenueTTM: ${this.FormatLargeNumbers(RevenueTTM)}\n
      GrossProfitTTM: ${this.FormatLargeNumbers(GrossProfitTTM)}\n
      DilutedEPSTTM: ${DilutedEPSTTM}\n
      QuarterlyEarningsGrowthYOY: ${QuarterlyEarningsGrowthYOY}\n
      QuarterlyRevenueGrowthYOY: ${QuarterlyRevenueGrowthYOY}\n
      AnalystTargetPrice: ${AnalystTargetPrice}\n
      TrailingPE: ${TrailingPE}\n
      ForwardPE: ${ForwardPE}\n
      PriceToSalesRatioTTM: ${PriceToSalesRatioTTM}\n
      PriceToBookRatio: ${PriceToBookRatio}\n
      EVToRevenue: ${EVToRevenue}\n
      EVToEBITDA: ${EVToEBITDA}\n
      Beta: ${Beta}\n
      52WeekHigh: ${data['52WeekHigh']}\n
      52WeekLow: ${data['52WeekLow']}\n
      `,

      fourth: `
      50DayMovingAverage: ${data['50DayMovingAverage']}\n
      200DayMovingAverage: ${data['200DayMovingAverage']}\n
      SharesOutstanding: ${this.FormatLargeNumbers(SharesOutstanding)}\n
      SharesFloat: ${this.FormatLargeNumbers(SharesFloat)}\n
      SharesShort: ${this.FormatLargeNumbers(SharesShort)}\n
      SharesShortPriorMonth: ${this.FormatLargeNumbers(SharesShortPriorMonth)}\n
      ShortRatio: ${ShortRatio}\n
      ShortPercentOutstanding: ${ShortPercentOutstanding}\n
      ShortPercentFloat: ${ShortPercentFloat}\n
      PercentInsiders: ${PercentInsiders}\n
      PercentInstitutions: ${PercentInstitutions}\n
      ForwardAnnualDividendRate: ${ForwardAnnualDividendRate}\n
      ForwardAnnualDividendYield: ${ForwardAnnualDividendYield}\n
      PayoutRatio: ${PayoutRatio}\n
      DividendDate: ${DividendDate}\n
      ExDividendDate: ${ExDividendDate}\n
      LastSplitFactor: ${LastSplitFactor}\n
      LastSplitDate: ${LastSplitDate}`,

      fifth: `For more visit https://www.earningsfly.com/stocks/${ticker}?source=t2`,
    };

    return overviewData;
  }
}
