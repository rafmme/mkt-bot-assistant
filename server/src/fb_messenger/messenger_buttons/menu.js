import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

const listOfButtons = new ButtonList();

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Crypto coins prices',
    payload: 'SHOW_CRYPTOS_PRICES',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Market Top Movers',
    payload: 'TOP_MOVERS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Market News',
    payload: 'MARKET_NEWS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Check a US Market stock',
    payload: 'CHECK_STOCK',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'web_url',
    title: 'Trade on T212',
    url: 'https://www.trading212.com/en/login',
  }),
);

export default listOfButtons.getButtons();
