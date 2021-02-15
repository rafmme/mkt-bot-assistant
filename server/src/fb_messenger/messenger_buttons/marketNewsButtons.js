import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

const buttons = new ButtonList();

buttons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Market News Content',
    payload: 'SHOW_MARKET_NEWS_CONTENT',
  }),
);

buttons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Market News Summary',
    payload: 'SHOW_MARKET_NEWS_SUMMARY',
  }),
);

buttons.addButton(
  MessengerButtonFactory.CreateButton({
    type: 'postback',
    title: 'Show Market News Preview',
    payload: 'SHOW_MARKET_NEWS_PREVIEW',
  }),
);

export default buttons.getButtons();
