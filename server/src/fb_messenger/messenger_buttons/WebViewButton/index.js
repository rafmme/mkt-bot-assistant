import Button from '../Button';

/**
 * @classdesc
 * @class WebViewButton
 */
export default class WebViewButton extends Button {
  /**
   * @constructor
   * @param {*} title
   * @param {*} url
   */
  constructor(title, url) {
    super(title);
    this.type = 'web_url';
    this.url = url;
  }
}
