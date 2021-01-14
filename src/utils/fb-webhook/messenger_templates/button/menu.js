import createButton from '.';
import createMessengerTemplate from '..';

const checkStockButton = createButton({
  type: 'postback',
  title: 'Check a US Market stock',
  payload: 'CHECK_STOCK',
});

const showCryptoPricesButton = createButton({
  type: 'postback',
  title: 'Show Crypto coins prices',
  payload: 'SHOW_CRYPTOS',
});

const showMarketTopMoversButton = createButton({
  type: 'postback',
  title: 'Show Market Top Movers',
  payload: 'TOP_MOVERS',
});

const showMarketNewsButton = createButton({
  type: 'postback',
  title: 'Show Market News',
  payload: 'MARKET_NEWS',
});

const liveTradeButton = createButton({
  type: 'web_url',
  title: 'Trade on T212',
  url: 'https://www.trading212.com/en/login',
});

// eslint-disable-next-line prettier/prettier
const firstButtons = [
  showMarketNewsButton,
  showCryptoPricesButton,
  showMarketTopMoversButton,
];

const secondButtons = [checkStockButton, liveTradeButton];

/**
 * @description
 * @param {String} text Button Title
 * @returns {Object} Button messenger template for menu
 */
const menuButtonTemplate = (text, buttons) => {
  return createMessengerTemplate({
    type: 'button',
    text,
    buttons,
  });
};

export { firstButtons, secondButtons, menuButtonTemplate };
