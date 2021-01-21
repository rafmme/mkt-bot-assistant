import MessengerTemplate from '../MessengerTemplate';

/**
 * @classdesc
 * @class ButtonTemplate
 */
export default class ButtonTemplate extends MessengerTemplate {
  /**
   * @constructor
   * @param {*} text
   * @param {*} buttons
   */
  constructor(text, buttons) {
    super();
    this.payload.template_type = 'button';
    this.payload.text = text;
    this.payload.buttons = buttons;
  }
}
