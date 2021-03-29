import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

/**
 * @description
 * @param {String} ticker
 */
const createStockOptionButtons = (ticker) => {
  const listOfButtons = new ButtonList();

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Quote' : `${ticker.toUpperCase()} Quote`,
      payload: !ticker ? 'TICKER_QUOTE' : `TICKER_QUOTE|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Ticker News' : `${ticker.toUpperCase()} News`,
      payload: !ticker ? 'TICKER_NEWS' : `TICKER_NEWS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock SEC Filings' : `${ticker.toUpperCase()} SEC Filings`,
      payload: !ticker ? 'STOCK_SEC_FILINGS' : `STOCK_SEC_FILINGS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Peers' : `${ticker.toUpperCase()} Peers`,
      payload: !ticker ? 'STOCK_PEERS' : `STOCK_PEERS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Overview' : `${ticker.toUpperCase()} Overview`,
      payload: !ticker ? 'TICKER_OVERVIEW' : `TICKER_OVERVIEW|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Balance Sheet' : `${ticker.toUpperCase()} Balance Sheet`,
      payload: !ticker ? 'STOCK_BALANCE_SHEET' : `STOCK_BALANCE_SHEET|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Analyst Ratings' : `${ticker.toUpperCase()} Analyst Ratings`,
      payload: !ticker ? 'STOCK_ANALYST_RATINGS' : `STOCK_ANALYST_RATINGS|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Recommendations' : `${ticker.toUpperCase()} Recommendations`,
      payload: !ticker ? 'STOCK_RECOMMENDATION' : `STOCK_RECOMMENDATION|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Upgrades/Downgrades' : `${ticker.toUpperCase()} Upgrades/Downgrades`,
      payload: !ticker ? 'STOCK_UPGRADE' : `STOCK_UPGRADE|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock Earnings History' : `${ticker.toUpperCase()} Earnings History`,
      payload: !ticker ? 'STOCK_EARNINGS_HISTORY' : `STOCK_EARNINGS_HISTORY|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: !ticker ? 'Stock TA Indicator' : `${ticker.toUpperCase()} TA Indicator`,
      payload: !ticker ? 'STOCK_TAI' : `STOCK_TAI|${ticker}`,
    }),
  );

  return listOfButtons.getButtons();
};

export default createStockOptionButtons;
