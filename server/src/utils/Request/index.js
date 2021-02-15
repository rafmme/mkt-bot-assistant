import Util from '..';

/**
 * @class Request
 * @classdesc
 */
export default class Request {
  /**
   * @constructor
   * @description
   * @param {*} object
   */
  constructor() {
    this.url = '';
    this.params = {};
    this.method = '';
    this.data = {};
    this.headers = {};
  }

  /**
   * @description
   * @method
   */
  async send() {
    // eslint-disable-next-line no-return-await
    return await Util.MakeHTTPRequest(this);
  }
}
