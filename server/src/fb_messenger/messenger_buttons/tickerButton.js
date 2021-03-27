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
      title: `View ${symbol}`,
      payload: `STOCK_OPS|${symbol}`,
    }),
  );

  return buttons.getButtons();
};

export default createTickerOptionButtons;
