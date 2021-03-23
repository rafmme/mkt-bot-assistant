import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

const listOfButtons = new ButtonList();

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Quote',
    payload: 'TICKER_QUOTE',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Ticker News',
    payload: 'TICKER_NEWS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Overview',
    payload: 'TICKER_OVERVIEW',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Balance Sheet',
    payload: 'STOCK_BALANCE_SHEET',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Analyst Ratings',
    payload: 'STOCK_ANALYST_RATINGS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Recommendations',
    payload: 'STOCK_RECOMMENDATION',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Upgrades/Downgrades',
    payload: 'STOCK_UPGRADE',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Stock Insider Roster',
    payload: 'STOCK_INSIDER',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Set Stock Price Alert',
    payload: 'STOCK_PRICE_ALERT',
  }),
);

export default listOfButtons.getButtons();
