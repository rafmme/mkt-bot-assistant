import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import MemCachier from '../cache/memcachier';
import holidaysData from '../data/holiday';
import StockAPI from '../stock_apis';
import Util from '../utils';
import RequestBuilder from '../utils/Request/RequestBuilder';

dotenv.config();
const { PORT: APP_PORT, HEROKU_APP_URL, TELEGRAM_TOKEN } = process.env;
const PORT = Number.parseInt(APP_PORT, 10) || 3000;
const url = `${HEROKU_APP_URL}:443`;

const configOptions = {
  polling: true,
  webHook: {
    port: PORT,
  },
};

const TeleBot = new TelegramBot(TELEGRAM_TOKEN, configOptions);
TeleBot.setWebHook(`${url}/bot${TELEGRAM_TOKEN}`);

const storeUserData = async (chatId) => {
  await new RequestBuilder()
    .withURL(`${HEROKU_APP_URL}/api`)
    .method('POST')
    .data({
      query: `mutation { addUser(facebookId: "TelgBoT_${chatId}", fullName: "user", profilePic: "https://dummyimg") }`,
    })
    .build()
    .send();
};

const getMarketHolidays = async () => {
  TeleBot.onText(/\/holidays/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = Util.GetUpcomingHolidays(holidaysData);
    TeleBot.sendMessage(chatId, response);
    TeleBot.sendMessage(chatId, Util.FundSolicitation());
  });
};

const getEconomicEvents = async () => {
  TeleBot.onText(/\/events/, async (msg) => {
    let data = await MemCachier.GetHashItem('ec_calendar');

    if (!data) {
      data = await StockAPI.GetEconomicCalendar();
    }

    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = Util.CreateEconomicCalendarText(data);
    TeleBot.sendMessage(chatId, response);
    TeleBot.sendMessage(chatId, Util.FundSolicitation());
  });
};

const getStockInfo = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const ticker = Util.GetTicker(msg.text);

    if (ticker) {
      let overview = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Overview`);

      if (!overview) {
        overview = await StockAPI.GetStockOverview(ticker);
      }

      const response = await Util.ParseStockDataTelegram(overview, ticker);
      TeleBot.sendMessage(chatId, response);
      //  TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getAboutMe = async () => {
  TeleBot.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = Util.AboutBot();
    TeleBot.sendMessage(chatId, response);
  });
};

const getTrendingStocks = async () => {
  TeleBot.onText(/\/trending/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = await Util.ParseTelegramTrendingTickersData();
    TeleBot.sendMessage(chatId, response);
    TeleBot.sendMessage(chatId, Util.FundSolicitation());
  });
};

const getMovers = async () => {
  TeleBot.onText(/\/movers/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = await Util.ParseTelegramTopMoversData();
    TeleBot.sendMessage(chatId, response);
    TeleBot.sendMessage(chatId, Util.FundSolicitation());
  });
};

const getNews = async () => {
  TeleBot.onText(/\/news/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const response = await Util.TelegramNews();
    TeleBot.sendMessage(chatId, response[0]);
    TeleBot.sendMessage(chatId, response[1]);
  });
};

const startTelegramBot = async () => {
  await getMarketHolidays();
  await getAboutMe();
  await getEconomicEvents();
  await getStockInfo();
  await getMovers();
  await getNews();
  await getTrendingStocks();
};

export { startTelegramBot, TeleBot };
