import PostBackButton from '../PostBackButton';
import QuickReplyPostBackButton from '../PostBackButton/quickreplyBtn';
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
  static CreateButton({ type, url, payload, title, imageUrl }) {
    let button;

    switch (type) {
      case 'web_url':
        button = new WebViewButton(title, url);
        break;

      case 'postback':
        button = new PostBackButton(title, payload);
        break;

      case 'quick_reply':
        button = new QuickReplyPostBackButton(title, payload, imageUrl);
        break;

      default:
        break;
    }

    return button;
  }
}
