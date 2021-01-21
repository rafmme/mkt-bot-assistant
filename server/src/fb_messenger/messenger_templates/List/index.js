import MessengerTemplate from '../MessengerTemplate';

/**
 * @classdesc
 * @class ListTemplate
 */
export default class ListTemplate extends MessengerTemplate {
  /**
   * @constructor
   * @param {*} listType
   * @param {*} elements
   * @param {*} buttons
   */
  constructor(listType, elements, buttons) {
    super();
    this.payload.template_type = 'list';
    this.payload.top_element_style = listType === 'compact' ? listType : undefined;
    this.payload.elements = elements;
    this.payload.buttons = buttons;
  }
}
