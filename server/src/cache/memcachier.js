/* eslint-disable consistent-return */
import memjs from 'memjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @class
 * @classdesc
 */
export default class MemCachier {
  /**
   * @constructor
   * @description
   */
  constructor() {
    const { MEMCACHIER_SERVERS, MEMCACHIER_USERNAME, MEMCACHIER_PASSWORD } = process.env;

    if (typeof MemCachier.instance === 'object') {
      return MemCachier.instance;
    }

    this.memCachierClient = memjs.Client.create(MEMCACHIER_SERVERS, {
      failover: true,
      timeout: 1,
      keepAlive: true,
      username: MEMCACHIER_USERNAME,
      password: MEMCACHIER_PASSWORD,
    });

    MemCachier.instance = this;
    return this;
  }

  /**
   * @static
   * @description
   */
  static GetInstance() {
    const MemCachierObject = new this();
    return MemCachierObject;
  }

  /**
   * @static
   * @description
   * @param {*} key
   * @returns {} item
   */
  static async GetItem(key) {
    try {
      const { value } = await this.GetInstance().memCachierClient.get(key);
      return value.toString();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @static
   * @description
   * @param {*} key
   * @param {} value
   * @param {Number} ttl
   * @returns {} item
   */
  static async SetItem(key, value, ttl) {
    try {
      const result = await this.GetInstance().memCachierClient.set(key, value, { expires: ttl });
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @static
   * @description
   * @param {*} key
   * @returns {} item
   */
  static async GetHashItem(key) {
    try {
      const { value } = await this.GetInstance().memCachierClient.get(key);
      return JSON.parse(value.toString());
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @static
   * @description
   * @param {*} key
   * @param {} value
   * @param {} ttl
   * @returns {} item
   */
  static async SetHashItem(key, value, ttl) {
    try {
      const str = JSON.stringify(value);
      const result = await this.GetInstance().memCachierClient.set(key, str, { expires: ttl });

      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
