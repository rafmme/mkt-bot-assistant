import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import MemCachier from '../cache/memcachier';
import holidaysData from '../data/holiday';
import StockAPI from '../stock_apis';
import Util from '../utils';
import RequestBuilder from '../utils/Request/RequestBuilder';

dotenv.config();
const { HEROKU_APP_URL, TELEGRAM_TOKEN, TG_ID } = process.env;

const configOptions = {
  polling: true,
};

const TeleBot = new TelegramBot(TELEGRAM_TOKEN, configOptions);

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
    const receivedMsg = msg.text.startsWith('$') ? msg.text.split(' ') : null;

    if (receivedMsg && receivedMsg.length > 1) {
      if (receivedMsg[1].toLowerCase() === 'news') {
        const symbol = receivedMsg[0].split('$')[1];
        const response = await Util.ParseTelegramTickerNewsData(symbol);
        TeleBot.sendMessage(chatId, response);
        return;
      }
    }

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

const getCryptoInfo = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId);
    const symbol = Util.GetCryptoSymbol(msg.text);

    if (symbol) {
      const response = await Util.ParseTelegramCryptoPriceData(symbol);

      if (response) {
        TeleBot.sendMessage(chatId, response);
        //  TeleBot.sendMessage(chatId, Util.FundSolicitation());å
      }
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

const broadcastMessage = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    const receivedMsg = msg.text;

    const sendMessage = (receipientId, message) => {
      TeleBot.sendMessage(receipientId, message);
    };

    if (`${TG_ID}` === `${chatId}` && (receivedMsg.startsWith('BCM|') || receivedMsg.startsWith('bcm|'))) {
      const bcData = receivedMsg.split('|');

      if (bcData[1] === 'all') {
        const users = await Util.GetAllUsers();

        for (let index = 0; index < users.length; index += 1) {
          const userId = users[index].facebookId;

          if (userId.startsWith('TelgBoT_')) {
            const receiverId = userId.split('TelgBoT_')[1];
            sendMessage(receiverId, bcData[2]);
          }
        }
        return;
      }

      sendMessage(bcData[1], bcData[2]);
    }
  });
};

const startTelegramBot = async () => {
  await getMarketHolidays();
  await getAboutMe();
  await getEconomicEvents();
  await getCryptoInfo();
  await getStockInfo();
  await getMovers();
  await getNews();
  await getTrendingStocks();
  await broadcastMessage();
};

export { startTelegramBot, TeleBot };
