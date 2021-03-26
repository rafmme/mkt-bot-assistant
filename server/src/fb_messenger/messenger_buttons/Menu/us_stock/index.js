import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

/**
 * @description
 * @param {*} ticker
 */
const createStockOptionButtons = (ticker) => {
  const listOfButtons = new ButtonList();

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Quote',
      payload: !ticker ? 'TICKER_QUOTE' : `TICKER_QUOTE|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Ticker News',
      payload: !ticker ? 'TICKER_NEWS' : `TICKER_NEWS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Overview',
      payload: !ticker ? 'TICKER_OVERVIEW' : `TICKER_OVERVIEW|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Balance Sheet',
      payload: !ticker ? 'STOCK_BALANCE_SHEET' : `STOCK_BALANCE_SHEET|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Analyst Ratings',
      payload: !ticker ? 'STOCK_ANALYST_RATINGS' : `STOCK_ANALYST_RATINGS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Recommendations',
      payload: !ticker ? 'STOCK_RECOMMENDATION' : `STOCK_RECOMMENDATION|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Upgrades/Downgrades',
      payload: !ticker ? 'STOCK_UPGRADE' : `STOCK_UPGRADE|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Earnings History',
      payload: !ticker ? 'STOCK_EARNINGS_HISTORY' : `STOCK_EARNINGS_HISTORY|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Stock Insider Roster',
      payload: !ticker ? 'STOCK_INSIDER' : `STOCK_INSIDER|${ticker}`,
    }),
  );

  return listOfButtons.getButtons();
};

export default createStockOptionButtons;
