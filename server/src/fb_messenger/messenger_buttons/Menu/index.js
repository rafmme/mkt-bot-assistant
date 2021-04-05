import ButtonList from '../Button/buttonList';
import MessengerButtonFactory from '../ButtonFactory';

const listOfButtons = new ButtonList();

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Show List of Menu',
    payload: 'MENU_LIST',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Donate (Help My Creator)',
    payload: 'DONATE',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Read News',
    payload: 'MENU_NEWS',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Check US Market',
    payload: 'MENU_US_MARKET',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Check Nigeria Market',
    payload: 'MENU_NGN_UPDATES',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Check Crypto',
    payload: 'MENU_CRYPTO',
  }),
);

listOfButtons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'quick_reply',
    title: 'Give FeedBack',
    payload: 'FEEDBACK',
  }),
);

export default listOfButtons.getButtons();
