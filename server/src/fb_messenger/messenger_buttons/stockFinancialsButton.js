import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {String} ticker
 */
const createStockFinancialsOptionButtons = (ticker) => {
  const listOfButtons = new ButtonList();

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Annual Balance Sheet`,
      payload: `STOCK_BALANCE_SHEET_A|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Quaterly Balance Sheet`,
      payload: `STOCK_BALANCE_SHEET_Q|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Annual Cash Flow`,
      payload: `STOCK_CASH_FLOW_A|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Quaterly Cash Flow`,
      payload: `STOCK_CASH_FLOW_Q|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Annual Income Statement`,
      payload: `STOCK_INCOME_A|${ticker}`,
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: `${ticker.toUpperCase()} Quaterly Income Statement`,
      payload: `STOCK_INCOME_Q|${ticker}`,
    }),
  );

  return listOfButtons.getButtons();
};

export default createStockFinancialsOptionButtons;
