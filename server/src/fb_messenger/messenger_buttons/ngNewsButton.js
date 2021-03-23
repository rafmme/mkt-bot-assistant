import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {*} newsId
 * @param {*} url
 * @param {} content
 */
const createNgNewsOptionButtons = (url) => {
  const buttons = new ButtonList();

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'web_url',
      title: 'Open',
      url,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'postback',
      title: 'Read Content',
      payload: `SHOW_NG_NEWS_SUMMARY|${url}`,
    }),
  );

  return buttons.getButtons();
};

export default createNgNewsOptionButtons;
