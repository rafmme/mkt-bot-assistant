import Request from '.';

/**
 * @class RequestBuilder
 * @classdesc
 */
export default class RequestBuilder {
  /**
   * @constructor
   * @description
   */
  constructor() {
    this.request = new Request();
  }

  /**
   * @method
   * @param {*} url
   * @returns
   */
  withURL(url) {
    this.request.url = url;
    return this;
  }

  /**
   * @method
   * @param {*} method
   * @returns
   */
  method(method) {
    this.request.method = method;
    return this;
  }

  /**
   * @method
   * @param {*} headers
   * @returns
   */
  headers(headers) {
    this.request.headers = headers;
    return this;
  }

  /**
   * @method
   * @param {*} qs
   * @returns
   */
  queryParams(qs) {
    this.request.params = qs;
    return this;
  }

  /**
   * @method
   * @param {*} data
   * @returns
   */
  data(data) {
    this.request.data = data;
    return this;
  }

  /**
   * @method
   * @returns
   */
  build() {
    return this.request;
  }
}
