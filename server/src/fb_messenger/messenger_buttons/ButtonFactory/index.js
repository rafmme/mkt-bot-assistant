import PostBackButton from '../PostBackButton';
import WebViewButton from '../WebViewButton';

/**
 * @classdesc
 * @class MessengerButtonFactory
 */
export default class MessengerButtonFactory {
  /**
   * @static
   * @description
   * @param {*} param0
   */
  static CreateButton({ type, url, payload, title }) {
    let button;

    switch (type) {
      case 'web_url':
        button = new WebViewButton(title, url);
        break;

      case 'postback':
        button = new PostBackButton(title, payload);
        break;

      default:
        break;
    }

    return button;
  }
}
