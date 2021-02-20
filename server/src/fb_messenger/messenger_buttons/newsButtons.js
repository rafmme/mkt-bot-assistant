import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {*} newsId
 * @param {*} url
 */
const createNewsOptionButtons = (newsId, url) => {
  const buttons = new ButtonList();

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'web_url',
      title: 'View',
      url,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'postback',
      title: 'Show Summary',
      payload: `SHOW_MARKET_NEWS_SUMMARY|${newsId}`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'postback',
      title: 'Show Content',
      payload: `SHOW_MARKET_NEWS_CONTENT|${newsId}`,
    }),
  );

  return buttons.getButtons();
};

export default createNewsOptionButtons;
