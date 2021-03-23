import ButtonList from '../../Button/buttonList';
import MessengerButtonFactory from '../../ButtonFactory';

const listOfButtons = new ButtonList();

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

export default listOfButtons.getButtons();
