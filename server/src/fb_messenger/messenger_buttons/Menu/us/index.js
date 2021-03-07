import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

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
    title: 'Earnings for the Week',
    payload: 'EARNING_WEEK',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Earnings for the Month',
    payload: 'EARNING_MONTH',
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
    title: 'Economic Calendar for US',
    payload: 'ECON_CALENDAR',
  }),
);

export default listOfButtons.getButtons();
