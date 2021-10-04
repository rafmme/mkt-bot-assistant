import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import MemCachier from '../cache/memcachier';
import holidaysData from '../data/holiday';
import StockAPI from '../stock_apis';
import Util from '../utils';

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

const getMarketHolidays = () => {
  TeleBot.onText(/\/holidays/, (msg) => {
    const chatId = msg.chat.id;
    const response = Util.GetUpcomingHolidays(holidaysData);
    TeleBot.sendMessage(chatId, response);
  });
};

const getEconomicEvents = async () => {
  TeleBot.onText(/\/events/, async (msg) => {
    let data = await MemCachier.GetHashItem('ec_calendar');

    if (!data) {
      data = await StockAPI.GetEconomicCalendar();
    }

    const chatId = msg.chat.id;
    const response = Util.CreateEconomicCalendarText(data);
    TeleBot.sendMessage(chatId, response);
  });
};

const getStockInfo = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    const ticker = Util.GetTicker(msg.text);

    if (ticker) {
      let overview = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Overview`);

      if (!overview) {
        overview = await StockAPI.GetStockOverview(ticker);
      }

      const response = await Util.ParseStockDataTelegram(overview, ticker);
      TeleBot.sendMessage(chatId, response);
    }
  });
};

const startTelegramBot = async () => {
  getMarketHolidays();
  await getEconomicEvents();
  await getStockInfo();
};

export default startTelegramBot;
