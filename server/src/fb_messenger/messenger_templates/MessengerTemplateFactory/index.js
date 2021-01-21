import ButtonTemplate from '../Button';
import ListTemplate from '../List';
import MediaTemplate from '../Media';
import MessengerTemplate from '../MessengerTemplate';

/**
 * @classdesc
 * @class MessengerTemplateFactory
 */
export default class MessengerTemplateFactory {
  /**
   * @static
   * @description
   * @param {*} param0
   */
  static CreateTemplate({ type, text, buttons, elements, listType }) {
    let template;

    switch (type) {
      case 'button':
        template = new ButtonTemplate(text, buttons);
        break;

      case 'list':
        template = new ListTemplate(listType, elements, buttons);
        break;

      case 'media':
        template = new MediaTemplate(elements);
        break;

      default:
        template = new MessengerTemplate();
        break;
    }

    return template;
  }
}
