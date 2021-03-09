import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {*} symbol
 */
const createTickerOptionButtons = (symbol) => {
  const buttons = new ButtonList();

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'postback',
      title: `View ${symbol} Quote`,
      payload: `CHECK_STOCK|${symbol}`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'postback',
      title: `View ${symbol} Overview`,
      payload: `STOCK_OVERVIEW|${symbol}`,
    }),
  );

  return buttons.getButtons();
};

export default createTickerOptionButtons;
