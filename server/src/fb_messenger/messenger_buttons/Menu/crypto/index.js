import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

/**
 * @description
 * @param {*} cryptoSymbol
 */
const createCryptoOptionButtons = (cryptoSymbol) => {
  const listOfButtons = new ButtonList();

  if (cryptoSymbol) {
    listOfButtons.addButton(
      MessengerButtonFactory.CreateButton({
        type: 'quick_reply',
        title: 'Check Crypto Coin Price',
        payload: `CRYPTO_PRICE|${cryptoSymbol}`,
      }),
    );

    return listOfButtons.getButtons();
  }

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Crypto News',
      payload: 'CRYPTO_NEWS',
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Cryptos Price list',
      payload: 'SHOW_CRYPTOS_PRICES',
    }),
  );

  listOfButtons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'Check Crypto Coin Price',
      payload: 'CRYPTO_PRICE',
    }),
  );

  return listOfButtons.getButtons();
};

export default createCryptoOptionButtons;
