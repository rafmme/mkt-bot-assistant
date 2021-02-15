import MessengerTemplate from '../MessengerTemplate';

/**
 * @classdesc
 * @class ListTemplate
 */
export default class ListTemplate extends MessengerTemplate {
  /**
   * @constructor

   * @param {*} elements
   */
  constructor(elements) {
    super();
    this.payload.template_type = 'generic';
    this.payload.elements = elements;
  }
}
