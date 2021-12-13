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

const storeUserData = async (chatId, { userId, name }) => {
  await new RequestBuilder()
    .withURL(`${HEROKU_APP_URL}/api`)
    .method('POST')
    .data({
      query: `mutation { addUser(facebookId: "TelgBoT_${chatId}", fullName: "user", profilePic: "https://dummyimg") }`,
    })
    .build()
    .send();

  await new RequestBuilder()
    .withURL(`${HEROKU_APP_URL}/api`)
    .method('POST')
    .data({
      query: `mutation { addUser(facebookId: "PVU_${userId}", fullName: "${name}", profilePic: "https://dummyimg") }`,
    })
    .build()
    .send();
};

const getMarketHolidays = async () => {
  TeleBot.onText(/\/holidays/, async (msg) => {
    const re1 = /^\/holidays$/;
    const re2 = /^\/holidays@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = Util.GetUpcomingHolidays(holidaysData);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getEconomicEvents = async () => {
  TeleBot.onText(/\/events/, async (msg) => {
    const re1 = /^\/events$/;
    const re2 = /^\/events@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      let data = await MemCachier.GetHashItem('ec_calendar');

      if (!data) {
        data = await StockAPI.GetEconomicCalendar();
      }

      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = Util.CreateEconomicCalendarText(data);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getUpcomingIPO = async () => {
  TeleBot.onText(/\/ipo/, async (msg) => {
    const re1 = /^\/ipo$/;
    const re2 = /^\/ipo@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.ParseTelegramIPOCalendarData();
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getStockInfo = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
    const ticker = Util.GetTicker(msg.text);
    const receivedMsg = msg.text.startsWith('$') ? msg.text.split(' ') : null;

    if (msg.text.startsWith('/overview') || msg.text.startsWith('/tnews') || msg.text.startsWith('/search')) {
      return;
    }

    if (receivedMsg && receivedMsg.length > 1) {
      if (receivedMsg[1].toLowerCase() === 'news') {
        const symbol = receivedMsg[0].split('$')[1];
        const response = await Util.ParseTelegramTickerNewsData(symbol);
        TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
        return;
      }

      if (receivedMsg[1].toLowerCase() === 'overview') {
        const symbol = receivedMsg[0].split('$')[1];
        const response = await Util.ParseTelegramStockOverviewData(symbol);
        const { first, second, third, fourth } = response;

        if (typeof response === 'string') {
          TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
          return;
        }

        TeleBot.sendMessage(chatId, first, { reply_to_message_id: msg.message_id });
        TeleBot.sendMessage(chatId, second, { reply_to_message_id: msg.message_id });
        TeleBot.sendMessage(chatId, third, { reply_to_message_id: msg.message_id });
        TeleBot.sendMessage(chatId, fourth, { reply_to_message_id: msg.message_id });
        return;
      }
    }

    if (ticker) {
      let overview = await MemCachier.GetHashItem(`${ticker.toLowerCase()}Overview`);

      if (!overview) {
        overview = await StockAPI.GetStockOverview(ticker);
      }

      const response = await Util.ParseStockDataTelegram(overview, ticker);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
    }
  });
};

const getCryptoInfo = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
    const symbol = Util.GetCryptoSymbol(msg.text);

    if (symbol) {
      const response = await Util.ParseTelegramCryptoPriceData(symbol);

      if (response) {
        TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      }
    }
  });
};

const getAboutMe = async () => {
  TeleBot.onText(/\/about/, async (msg) => {
    const re1 = /^\/about$/;
    const re2 = /^\/about@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = Util.AboutBot();
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
    }
  });
};

const getTrendingStocks = async () => {
  TeleBot.onText(/\/trending/, async (msg) => {
    const re1 = /^\/trending$/;
    const re2 = /^\/trending@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.ParseTelegramTrendingTickersData();
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getMovers = async () => {
  TeleBot.onText(/\/movers/, async (msg) => {
    const re1 = /^\/movers$/;
    const re2 = /^\/movers@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.ParseTelegramTopMoversData();
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, Util.FundSolicitation());
    }
  });
};

const getNews = async () => {
  TeleBot.onText(/\/news/, async (msg) => {
    const re1 = /^\/news$/;
    const re2 = /^\/news@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.TelegramNews();
      TeleBot.sendMessage(chatId, response[0], { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, response[1], { reply_to_message_id: msg.message_id });
    }
  });
};

const getNaijaNews = async () => {
  TeleBot.onText(/\/ngnews/, async (msg) => {
    const re1 = /^\/ngnews$/;
    const re2 = /^\/ngnews@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.TelegramNaijaNews();
      TeleBot.sendMessage(chatId, response[0], { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, response[1], { reply_to_message_id: msg.message_id });
    }
  });
};

const searchForCompanies = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;
    const searchKeyword = Util.SearchForTicker(msg.text);

    await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });

    if (searchKeyword) {
      const response = await Util.ParseTelegramCompaniesSearchResultData(searchKeyword);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
    }
  });
};

const getStockOverviewData = async () => {
  TeleBot.onText(/\/overview/, async (msg) => {
    const re1 = /^\/overview$/;
    const re2 = /^\/overview@LewisSMBot$/;
    const textArray = msg.text.split(' ');

    if ((re1.test(textArray[0]) || re2.test(textArray[0])) && textArray[1]) {
      const chatId = msg.chat.id;
      const ticker = Util.GetTicker(textArray[1]);
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });

      const response = await Util.ParseTelegramStockOverviewData(ticker);
      const { first, second, third, fourth } = response;

      if (typeof response === 'string') {
        TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
        return;
      }

      TeleBot.sendMessage(chatId, first, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, second, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, third, { reply_to_message_id: msg.message_id });
      TeleBot.sendMessage(chatId, fourth, { reply_to_message_id: msg.message_id });
    }
  });
};

const getTickerSearchData = async () => {
  TeleBot.onText(/\/search/, async (msg) => {
    const re1 = /^\/search$/;
    const re2 = /^\/search@LewisSMBot$/;
    const textArray = msg.text.split(' ');

    if ((re1.test(textArray[0]) || re2.test(textArray[0])) && textArray[1].length >= 1) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.ParseTelegramCompaniesSearchResultData(textArray[1]);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
    }
  });
};

const getTickerNews = async () => {
  TeleBot.onText(/\/tnews/, async (msg) => {
    const re1 = /^\/tnews$/;
    const re2 = /^\/tnews@LewisSMBot$/;
    const textArray = msg.text.split(' ');

    if ((re1.test(textArray[0]) || re2.test(textArray[0])) && textArray[1]) {
      const chatId = msg.chat.id;
      const ticker = Util.GetTicker(textArray[1]);
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      const response = await Util.ParseTelegramTickerNewsData(ticker);
      TeleBot.sendMessage(chatId, response, { reply_to_message_id: msg.message_id });
    }
  });
};

const handleStart = async () => {
  const botUsageInfo = (name) => {
    const user = ` ${name}` || ' ';
    return `Hi${user}, I am a bot created to give you updates on the US Stock.\n\nThe bot detects asset "Symbols" by prefixing the symbol with $ for Stock ticker or ¢ for Crypto coin. You can also add $ after a symbol for Crypto coin.
    \n\nCalling a symbol in any message that the bot can see will return the current price of the asset. Sending a message  like: "I need to buy some $aapl stock." will return the current price of the asset. It's case insensitive.
    \n\nCrypto coin example: "eth$" or "I'm purchasing some units of ¢BNB"
    \n\nGet news on a particular stock: "$aapl news"
    \n\nGet info on a particular stock: "$aapl overview"
    \n\nSearch for a company's ticker: "Search for Lucid Motors"
    \n\nCommands
          - /about - Information about me
          - /news - Read US Market general news headlines
          - /ngnews - Read news on the economy of Nigeria
          - /ipo - Show upcoming IPOs 
          - /holidays - Show upcoming holidays
          - /tnews $[symbol] - News about the symbol. 📰
          - /overview $[symbol] - General information about the symbol.
          - /movers - Show Top Gainers, Top Losers & Most Active for the present day
          - /search [keywords] Search for a company's ticker
          - /trending Trending Stocks for the present day
    \n\nInline Features
        You can type @LewisSMBot [keywords] in any chat or direct message to search for company's full list of stock and their tickers with the current price.`;
  };

  TeleBot.onText(/\/help/, async (msg) => {
    const re1 = /^\/help$/;
    const re2 = /^\/help@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      TeleBot.sendMessage(chatId, botUsageInfo(`${msg.from.first_name}`), { reply_to_message_id: msg.message_id });
    }
  });

  TeleBot.onText(/\/start/, async (msg) => {
    const re1 = /^\/start$/;
    const re2 = /^\/start@LewisSMBot$/;

    if (re1.test(msg.text) || re2.test(msg.text)) {
      const chatId = msg.chat.id;
      await storeUserData(chatId, { userId: msg.from.id, name: `${msg.from.first_name}` || 'user' });
      TeleBot.sendMessage(chatId, botUsageInfo(`${msg.from.first_name}`), { reply_to_message_id: msg.message_id });
    }
  });
};

const handleInlineQuery = async () => {
  TeleBot.on('inline_query', async (queryData) => {
    const { id, query } = queryData;
    const result = await Util.ParseInlineSearch(query);
    TeleBot.answerInlineQuery(id, result);
  });
};

const getPMs = async () => {
  TeleBot.onText(/(?:)/, async (msg) => {
    const chatId = msg.chat.id;

    if (`${TG_ID}` !== `${chatId}` && msg.chat.type === 'private') {
      const response = `From User ${msg.from.id} --- ${msg.from.first_name} ${msg.from.last_name}\n\n${msg.text}\n\n${msg.from.username}`;
      TeleBot.sendMessage(TG_ID, response);
    }
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

const handleSendImage = async () => {
  TeleBot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const receivedMsg = msg.caption;

    const sendImage = (receipientId, fileId) => {
      TeleBot.sendPhoto(receipientId, fileId);
    };

    if (`${TG_ID}` === `${chatId}` && (receivedMsg.startsWith('IMG|') || receivedMsg.startsWith('img|'))) {
      const bcData = receivedMsg.split('|');
      const fileId = msg.photo[0].file_id;

      if (bcData[1] === 'all') {
        const users = await Util.GetAllUsers();

        for (let index = 0; index < users.length; index += 1) {
          const userId = users[index].facebookId;

          if (userId.startsWith('TelgBoT_')) {
            const receiverId = userId.split('TelgBoT_')[1];
            sendImage(receiverId, fileId);
          }
        }
        return;
      }

      sendImage(bcData[1], fileId);
    }
  });
};

const startTelegramBot = async () => {
  await getMarketHolidays();
  await getAboutMe();
  await getEconomicEvents();
  await getUpcomingIPO();
  await getCryptoInfo();
  await getStockInfo();
  await getMovers();
  await getNews();
  await getNaijaNews();
  await getTrendingStocks();
  await searchForCompanies();
  await getStockOverviewData();
  await getTickerNews();
  await getTickerSearchData();
  await handleStart();
  await getPMs();
  await handleInlineQuery();
  await broadcastMessage();
  await handleSendImage();
};

export { startTelegramBot, TeleBot };
