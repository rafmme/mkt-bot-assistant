import Button from '../Button';

/**
 * @classdesc
 * @class PostBackButton
 */
export default class PostBackButton extends Button {
  /**
   * @constructor
   * @param {*} title
   * @param {*} payload
   */
  constructor(title, payload) {
    super(title);
    this.type = 'postback';
    this.payload = payload;
  }
}
