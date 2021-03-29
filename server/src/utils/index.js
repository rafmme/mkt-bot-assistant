/* eslint-disable no-case-declarations */
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
    if (!data && !data.companyName) {
      return `Sorry 😔, I'm unable to complete this request.`;
    }

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
    )}\nP/E Ratio: ${peRatio}\nPrice: $ ${latestPrice}\nPrice Change: $ ${change}\nPercent Change: ${
      changePercent * 100
    } %\n52 Week High: $ ${week52High}\n52 Week Low: $ ${week52Low}\nYTD: ${this.FormatLargeNumbers(ytdChange)}\nTime: ${latestTime}\n\n ** 15 minutes delayed quote **`;
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
        subtitle: `${text.split('-')[0].trim().toUpperCase()}\nExchange: ${fullExchangeName}`,
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
      )}\nEBITDA: ${this.FormatLargeNumbers(EBITDA)}\nPERatio: ${PERatio}\nPEGRatio: ${PEGRatio}\nBookValue: ${BookValue}\nDividendPerShare: ${DividendPerShare}\nDividendYield: ${
        DividendYield * 100
      }%\nEPS: ${EPS}`,

      third: `RevenuePerShareTTM: ${RevenuePerShareTTM}\nProfitMargin: ${ProfitMargin}\nOperatingMarginTTM: ${OperatingMarginTTM}\nReturnOnAssetsTTM: ${ReturnOnAssetsTTM}\nReturnOnEquityTTM: ${ReturnOnEquityTTM}\nRevenueTTM: ${this.FormatLargeNumbers(
        RevenueTTM,
      )}\nGrossProfitTTM: ${this.FormatLargeNumbers(
        GrossProfitTTM,
      )}\nDilutedEPSTTM: ${DilutedEPSTTM}\nQuarterlyEarningsGrowthYOY: ${QuarterlyEarningsGrowthYOY}\nQuarterlyRevenueGrowthYOY: ${QuarterlyRevenueGrowthYOY}\nAnalystTargetPrice: ${AnalystTargetPrice}\nTrailingPE: ${TrailingPE}\nForwardPE: ${ForwardPE}\nPriceToSalesRatioTTM: ${PriceToSalesRatioTTM}\nPriceToBookRatio: ${PriceToBookRatio}\nEVToRevenue: ${EVToRevenue}\nEVToEBITDA: ${EVToEBITDA}\nBeta: ${Beta}\n52WeekHigh: ${
        data['52WeekHigh']
      }\n52WeekLow: ${data['52WeekLow']}`,

      fourth: `50DayMovingAverage: ${data['50DayMovingAverage']}\n200DayMovingAverage: ${data['200DayMovingAverage']}\nSharesOutstanding: ${this.FormatLargeNumbers(
        SharesOutstanding,
      )}\nSharesFloat: ${this.FormatLargeNumbers(SharesFloat)}\nSharesShort: ${this.FormatLargeNumbers(SharesShort)}\nSharesShortPriorMonth: ${this.FormatLargeNumbers(
        SharesShortPriorMonth,
      )}\nShortRatio: ${ShortRatio}\nShortPercentOutstanding: ${ShortPercentOutstanding}\nShortPercentFloat: ${ShortPercentFloat}\nPercentInsiders: ${PercentInsiders}\nPercentInstitutions: ${PercentInstitutions}\nForwardAnnualDividendRate: ${ForwardAnnualDividendRate}\nForwardAnnualDividendYield: ${
        ForwardAnnualDividendYield * 100
      }%\nPayoutRatio: ${PayoutRatio}\nDividendDate: ${DividendDate}\nExDividendDate: ${ExDividendDate}\nLastSplitFactor: ${LastSplitFactor}\nLastSplitDate: ${LastSplitDate}`,

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
      type === 'cbn_rate'
        ? 'CBN EXCHANGE RATES\nNGN-USD\nNGN-GBP\nNGN-EUR\n'
        : 'Quotes: * morning, ** midday, *** evening\nNGN-USD (BUY/SELL)\nNGN-GBP (BUY/SELL)\nNGN-EUR (BUY/SELL)\n';

    if (type === 'bank_rate') {
      exchangeRates = 'DATE\nLOCATION\nBANK\nRATE\nCURRENCY\n';
    }

    if (!rates) {
      return `Sorry 😔, I'm unable to complete this request.`;
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
    let keyData = `******* ${ticker.toUpperCase()} ${splitData[0]} *******\n`;

    for (let i = 0; i < splitData.length; i += 2) {
      if (`${splitData[i + 1]} => ${splitData[i + 2]}` !== 'undefined => undefined') {
        keyData += `\n${splitData[i + 1]} => ${splitData[i + 2]}\n`;
      }
    }

    return keyData;
  }

  /**
   * @static
   * @description
   * @param {Object} data
   */
  static GetUpcomingHolidays(data) {
    const currentDate = new Date();
    const currentYearHolidays = data[`${currentDate.getFullYear()}`];
    let upcomingHolidays = `*** UPCOMING MARKET HOLIDAYS FOR YEAR ${currentDate.getFullYear()} ***\n\n`;

    for (let i = 0; i < currentYearHolidays.length; i += 1) {
      const date = new Date(currentYearHolidays[i].date);

      if (currentDate <= date) {
        if (currentDate.getMonth() === date.getMonth()) {
          upcomingHolidays += `** ⌛️ ${currentYearHolidays[i].date} => ${currentYearHolidays[i].holiday}\n\n`;
        } else {
          upcomingHolidays += `${currentYearHolidays[i].date} => ${currentYearHolidays[i].holiday}\n\n`;
        }
      }
    }

    return upcomingHolidays;
  }

  /**
   * @static
   * @description
   * @param {[]} data
   */
  static ParseCompaniesSearchResultData(data) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      list.push({
        title: `${data[i]['1. symbol']}`,
        subtitle: `${data[i]['2. name']}\nType: ${data[i]['3. type']}`,
        buttons: createTickerOptionButtons(`${data[i]['1. symbol']}`),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {String} symbol
   * @param {String} type
   */
  static CreateStockAnalysisText(data, symbol, type) {
    const { recommendationTrend, upgradeDowngradeHistory, financialData, earningsHistory, price } = data;
    let text = '';

    switch (type) {
      case 'ratings':
        if (!recommendationTrend) {
          return `Sorry 😔, no data was found for ${symbol}`;
        }

        const { trend } = recommendationTrend;
        text = `** ${price.shortName} [${symbol.toUpperCase()}] Analyst Ratings **\n\n`;

        for (let i = 0; i < trend.length; i += 1) {
          const { period, strongBuy, buy, hold, sell, strongSell } = trend[i];
          text += `Period: ${period.replace('-', '')}\nBuy: ${buy}\nStrong Buy: ${strongBuy}\nHold: ${hold}\nSell: ${sell}\nStrong Sell: ${strongSell}\n\n`;
        }
        break;

      case 'upgrades':
        if (!upgradeDowngradeHistory) {
          return `Sorry 😔, no data was found for ${symbol}`;
        }

        const { history } = upgradeDowngradeHistory;
        text = `** ${price.shortName} [${symbol.toUpperCase()}] Upgrades/Downgrades **\n\n`;

        for (let i = 0; i < 10; i += 1) {
          if (history[i]) {
            const { firm, toGrade, fromGrade, action } = history[i];
            text += `Firm: ${firm}\nFrom: ${fromGrade}\nTo: ${toGrade}\nAction: ${action}\n\n`;
          }
        }
        break;

      case 'recommendation':
        if (!financialData) {
          return `Sorry 😔, no data was found for ${symbol}`;
        }

        const { recommendationKey, recommendationMean, numberOfAnalystOpinions } = financialData;
        text = `** ${price.shortName} [${symbol.toUpperCase()}] Recommendation **\n\nRecommendation: ${recommendationKey.toUpperCase()}\nRecommendation Mean: ${
          recommendationMean.fmt
        }\nNumber of Analyst: ${numberOfAnalystOpinions.fmt}`;
        break;

      case 'earnings':
        if (!earningsHistory) {
          return `Sorry 😔, no data was found for ${symbol}`;
        }

        const { history: eHistory } = earningsHistory;
        text = `** ${price.shortName} [${symbol.toUpperCase()}] Earnings History **\n\n`;
        eHistory.reverse();

        for (let i = 0; i < eHistory.length; i += 1) {
          const { epsActual, epsEstimate, epsDifference, surprisePercent, quarter } = eHistory[i];
          if (Object.keys(quarter).length >= 1) {
            text += `Quarter: ${quarter.fmt}\nEPS Actual: ${epsActual.fmt}\nEPS Estimate: ${epsEstimate.fmt}\nEPS Difference: ${epsDifference.fmt}\nSurprise Percentage: ${surprisePercent.fmt}\n\n`;
          }
        }
        break;

      default:
        text = `Sorry 😔, no data was found for ${symbol}`;
        break;
    }

    return text;
  }

  /**
   * @static
   * @description
   * @param {*} data
   */
  static CreateEconomicCalendarText(data) {
    let text = '* US Economic Calendar 🗓 *\n\n';

    if (!data || data.length < 1) {
      return 'Sorry 😔, no data was found.';
    }

    for (let i = 0; i < data.length; i += 1) {
      const { event, impact, time } = data[i];
      text += `Event: ${event}\nImpact: ${impact.toUpperCase()}\nDate: ${time}\n\n`;
    }

    return text;
  }

  /**
   * @static
   * @description
   * @param {Array} data
   */
  static ParsePeersData(data) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      list.push({
        title: `${data[i]}`,
        subtitle: `${data[i]}`,
        buttons: createTickerOptionButtons(`${data[i]}`),
      });
    }

    return list;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {String} symbol
   * @param {String} resolution
   */
  static CreateTechnicalIndicatorText(data, symbol, resolution) {
    if (!data || Object.keys(data).length < 1) {
      return 'Sorry 😔, no data was found.';
    }

    const {
      technicalAnalysis: {
        count: { buy, neutral, sell },
        signal,
      },
      trend: { adx, trending },
    } = data;

    const signalText = signal ? signal.toUpperCase() : '-';
    const text = `* ${symbol.toUpperCase()} Technical Indicator [Resolution: ${resolution}] *\n\n👉🏽 Technical Analysis Count\n  Buy: ${buy}\n  Neutral: ${neutral}\n  Sell: ${sell}\n\n👉🏽 Signal => ${signalText}\n\n👉🏽 Trend\n  adx: ${adx}\n  Trending: ${trending}`;

    return text;
  }

  /**
   * @static
   * @description
   * @param {*} data
   * @param {String} symbol
   */
  static CreateSECFilingsText(data, symbol) {
    let text = `* ${symbol.toUpperCase()} SEC Filings *\n\n`;

    if (!data || data.length < 1) {
      return 'Sorry 😔, no data was found.';
    }

    for (let i = 0; i < data.length; i += 1) {
      const { accessNumber, cik, form, filedDate, acceptedDate, reportUrl, filingUrl } = data[i];
      text += `Access Number: ${accessNumber}\nCIK: ${cik}\nForm: ${form}\nFiled Date: ${filedDate}\nAccepted Date: ${acceptedDate}\nReport URL: ${reportUrl}\nFiling URL: ${filingUrl}\n\n`;
    }

    return text;
  }

  /**
   * @static
   * @description
   * @param {String} text
   */
  static EncodeURL(text) {
    return text.replace('-', '%2D').replace('^', '%5E').replace('.', '%2E');
  }

  /**
   * @static
   * @description
   * @param {Array} data
   */
  static ParseIPOCalendarData(data) {
    const list = [];

    for (let i = 0; i < data.length; i += 1) {
      const { date, exchange, name, numberOfShares, price, status, symbol, totalSharesValue } = data[i];
      list.push({
        title: `${name} [${symbol}]`,
        subtitle: `Date: ${date}\nPrice: ${price}\nStatus: ${status}\nEx: ${exchange}\nSh: ${this.FormatLargeNumbers(numberOfShares)}\nSh Value: $${this.FormatLargeNumbers(
          totalSharesValue,
        )}`,
      });
    }

    return list;
  }
}
