import ButtonList from './Button/buttonList';
import MessengerButtonFactory from './ButtonFactory';

/**
 * @description
 * @param {*} ticker
 */
const createTechnicalIndicatorOptionButtons = (ticker) => {
  const buttons = new ButtonList();

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: '1',
      payload: `TAI|${ticker.replace('$', '')}+1`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: '5',
      payload: `TAI|${ticker.replace('$', '')}+5`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: '15',
      payload: `TAI|${ticker.replace('$', '')}+15`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: '30',
      payload: `TAI|${ticker.replace('$', '')}+30`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: '60',
      payload: `TAI|${ticker.replace('$', '')}+60`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'D',
      payload: `TAI|${ticker.replace('$', '')}+D`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'W',
      payload: `TAI|${ticker.replace('$', '')}+W`,
    }),
  );

  buttons.addButton(
    MessengerButtonFactory.CreateButton({
      type: 'quick_reply',
      title: 'M',
      payload: `TAI|${ticker.replace('$', '')}+M`,
    }),
  );

  return buttons.getButtons();
};

export default createTechnicalIndicatorOptionButtons;
