import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

const timeString = new Date().toTimeString().split(' ')[0].split(':');
const currentTimeNumber = Number.parseInt(`${timeString[0]}${timeString[1]}`, 10);
const listOfButtons = new ButtonList();

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Check a Stock',
    payload: 'STOCK_OPS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'US Market News',
    payload: 'MARKET_NEWS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: currentTimeNumber >= 400 && currentTimeNumber < 930 ? 'Show Futures' : 'Show Indices',
    payload: currentTimeNumber >= 400 && currentTimeNumber < 930 ? 'MARKET_FUTURES' : 'MARKET_INDICES',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'US Market Top Movers',
    payload: 'TOP_MOVERS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Trending Tickers',
    payload: 'TRENDING_TICKERS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Search for Company',
    payload: 'SEARCH_COMPANY',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Earnings for Today',
    payload: 'EARNINGS_TODAY',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Earnings for the Week',
    payload: 'EARNINGS_WEEK',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Upcoming IPO',
    payload: 'IPO',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Upcoming Holidays',
    payload: 'HOLIDAY',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Economic Calendar for US',
    payload: 'ECON_CALENDAR',
  }),
);

export default listOfButtons.getButtons();
