/* eslint-disable consistent-return */
import axios from 'axios';
import dotenv from 'dotenv';
import createFinnHubNewsOptionButtons from '../fb_messenger/messenger_buttons/finnhubNewsButton';
import createNewsOptionButtons from '../fb_messenger/messenger_buttons/newsButtons';
import createNgNewsOptionButtons from '../fb_messenger/messenger_buttons/ngNewsButton';
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
      if (newsList[index].uuid === newsId || newsList[index].url === newsId) {
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
        title: `${name} ${symbol}    $ ${this.FormatLargeNumbers(price)}    MKT Cap: ${this.FormatLargeNumbers(market_cap)}`,
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
        title: `${symbol}     Price: $${regularMarketPrice}`,
        subtitle: `CHG: $${regularMarketChange}\n% CHG: ${regularMarketChangePercent}\n${shortName}\nExchange: ${exchange}`,
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
        ${text.split('-')[0].trim()}
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

    if (!Name) {
      const overviewData = `Visit https://www.earningsfly.com/stocks/${ticker}?source=t2`;
      return overviewData;
    }

    const overviewData = {
      first: `*** ${stockTicker} Overview ***\n\nAssetType: ${AssetType}\nName: ${Name}\nDescription: ${Description}`,

      second: `Exchange: ${Exchange}\nCurrency: ${Currency}\nCountry: ${Country}\nSector: ${Sector}\nIndustry: ${Industry}\nAddress: ${Address}\nFullTimeEmployees: ${FullTimeEmployees}\nFiscalYearEnd: ${FiscalYearEnd}\nLatestQuarter: ${LatestQuarter}\nMarketCapitalization: ${this.FormatLargeNumbers(
        MarketCapitalization,
      )}\nEBITDA: ${this.FormatLargeNumbers(
        EBITDA,
      )}\nPERatio: ${PERatio}\nPEGRatio: ${PEGRatio}\nBookValue: ${BookValue}\nDividendPerShare: ${DividendPerShare}\nDividendYield: ${DividendYield}\nEPS: ${EPS}`,

      third: `RevenuePerShareTTM: ${RevenuePerShareTTM}\nProfitMargin: ${ProfitMargin}\nOperatingMarginTTM: ${OperatingMarginTTM}\nReturnOnAssetsTTM: ${ReturnOnAssetsTTM}\nReturnOnEquityTTM: ${ReturnOnEquityTTM}\nRevenueTTM: ${this.FormatLargeNumbers(
        RevenueTTM,
      )}\nGrossProfitTTM: ${this.FormatLargeNumbers(
        GrossProfitTTM,
      )}\nDilutedEPSTTM: ${DilutedEPSTTM}\nQuarterlyEarningsGrowthYOY: ${QuarterlyEarningsGrowthYOY}\nQuarterlyRevenueGrowthYOY: ${QuarterlyRevenueGrowthYOY}\nAnalystTargetPrice: ${AnalystTargetPrice}\nTrailingPE: ${TrailingPE}\nForwardPE: ${ForwardPE}\nPriceToSalesRatioTTM: ${PriceToSalesRatioTTM}\nPriceToBookRatio: ${PriceToBookRatio}\nEVToRevenue: ${EVToRevenue}\nEVToEBITDA: ${EVToEBITDA}\nBeta: ${Beta}\n52WeekHigh: ${
        data['52WeekHigh']
      }\n52WeekLow: ${data['52WeekLow']}`,

      fourth: `50DayMovingAverage: ${data['50DayMovingAverage']}\n200DayMovingAverage: ${data['200DayMovingAverage']}\n
SharesOutstanding: ${this.FormatLargeNumbers(SharesOutstanding)}\nSharesFloat: ${this.FormatLargeNumbers(SharesFloat)}\nSharesShort: ${this.FormatLargeNumbers(
        SharesShort,
      )}\nSharesShortPriorMonth: ${this.FormatLargeNumbers(
        SharesShortPriorMonth,
      )}\nShortRatio: ${ShortRatio}\nShortPercentOutstanding: ${ShortPercentOutstanding}\nShortPercentFloat: ${ShortPercentFloat}\nPercentInsiders: ${PercentInsiders}\nPercentInstitutions: ${PercentInstitutions}\n
ForwardAnnualDividendRate: ${ForwardAnnualDividendRate}\nForwardAnnualDividendYield: ${ForwardAnnualDividendYield}\nPayoutRatio: ${PayoutRatio}\n
DividendDate: ${DividendDate}\nExDividendDate: ${ExDividendDate}\nLastSplitFactor: ${LastSplitFactor}\nLastSplitDate: ${LastSplitDate}`,

      fifth: `For more visit https://www.earningsfly.com/stocks/${ticker}?source=t2`,
    };

    return overviewData;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {} type
   */
  static ParseFinnHubNewsData(data, type) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      const { headline, url, image, summary } = data[i];

      list.push({
        title: headline.slice(0, 80),
        subtitle: `${summary.slice(0, 77)}...`,
        image_url: image,
        default_action: {
          type: 'web_url',
          url,
          webview_height_ratio: 'full',
        },
        buttons: createFinnHubNewsOptionButtons(url, type),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} rates
   * @param {} type
   */
  static ParseNGNRatesData(rates, type) {
    let exchangeRates =
      type === 'cbn_rate' ? 'CBN EXCHANGE RATES - NGN >> USD  GBP  EUR\n' : 'Quotes: * morning, ** midday, ***evening\nNGN >> USD (BUY/SELL) GBP (BUY/SELL) EUR (BUY/SELL)\n';

    if (type === 'bank_rate') {
      exchangeRates = 'DATE  LOCATION  BANK  RATE  CURRENCY\n';
    }

    if (type === 'usd_rate') {
      const dollarRate = rates[1].trim().split('\n')[1].split('/');

      return {
        buy: Number.parseFloat(dollarRate[0].trim(), 10),
        sell: Number.parseFloat(dollarRate[1].trim(), 10),
      };
    }

    for (let i = 1; i < rates.length; i += 1) {
      const el = rates[i];
      exchangeRates += `\n${el.replace('\n', '\t').trim()}\n`;
    }

    return exchangeRates;
  }

  /**
   * @static
   * @description
   * @param {[]} data
   */
  static ParseNgNews(data) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      const { title, image, url } = data[i];

      list.push({
        title,
        image_url: image,
        default_action: {
          type: 'web_url',
          url,
          webview_height_ratio: 'full',
        },
        buttons: createNgNewsOptionButtons(url),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {String} ticker
   * @param {String} data
   */
  static ParseScrapedStockData(ticker, data) {
    const splitData = data.split('\n');
    let keyData = `******* ${ticker} ${splitData[0]} *******\n`;

    for (let i = 0; i < splitData.length; i += 2) {
      if (`${splitData[i + 1]} => ${splitData[i + 2]}` !== 'undefined => undefined') {
        keyData += `\n${splitData[i + 1]} => ${splitData[i + 2]}\n`;
      }
    }

    return keyData;
  }
}
