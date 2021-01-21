import MessengerTemplate from '../MessengerTemplate';

/**
 * @classdesc
 * @class MediaTemplate
 */
export default class MediaTemplate extends MessengerTemplate {
  /**
   * @constructor
   * @param {*} elements
   */
  constructor(elements) {
    super();
    this.payload.template_type = 'media';
    this.payload.elements = elements;
  }
}
