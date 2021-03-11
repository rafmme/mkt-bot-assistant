import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {*} url
 * @param {*} type
 */
const createFinnHubNewsOptionButtons = (url, type) => {
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
      title: 'Read Summary',
      payload: `SHOW_FINNHUB_NEWS_SUMMARY|${type}+${url}`,
    }),
  );

  return buttons.getButtons();
};

export default createFinnHubNewsOptionButtons;
