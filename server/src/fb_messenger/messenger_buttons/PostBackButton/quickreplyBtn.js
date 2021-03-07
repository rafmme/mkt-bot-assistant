import PostBackButton from '.';

/**
 * @classdesc
 * @class QuickReplyPostBackButton
 */
export default class QuickReplyPostBackButton extends PostBackButton {
  /**
   * @constructor
   * @param {*} title
   * @param {*} payload
   * @param {*} imageUrl
   * @param {*} type
   */
  constructor(title, payload, imageUrl) {
    super(title, payload);
    this.type = undefined;
    this.content_type = 'text';
    this.image_url = imageUrl;
  }
}
