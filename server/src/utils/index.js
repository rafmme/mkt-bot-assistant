/* eslint-disable consistent-return */
import axios from 'axios';

/**
 * @class Util
 * @classdesc
 */
export default class Util {
  /**
   * @static
   * @description
   * @param {*} requestObject
   */
  static async MakeHTTPRequest(requestObject) {
    const { method, url, params, data } = requestObject;

    try {
      const response = await axios({
        method,
        url,
        params,
        data,
      });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
