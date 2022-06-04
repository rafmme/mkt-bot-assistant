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
    const { MEMCACHIER_BRONZE_SERVERS, MEMCACHIER_BRONZE_USERNAME, MEMCACHIER_BRONZE_PASSWORD } = process.env;

    if (typeof MemCachier.instance === 'object') {
      return MemCachier.instance;
    }

    this.memCachierClient = memjs.Client.create(MEMCACHIER_BRONZE_SERVERS, {
      failover: true,
      timeout: 1,
      keepAlive: true,
      username: MEMCACHIER_BRONZE_USERNAME,
      password: MEMCACHIER_BRONZE_PASSWORD,
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

      const item = value ? value.toString() : value;
      return item;
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

      const item = value ? JSON.parse(value.toString()) : value;
      return item;
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

  /**
   * @static
   * @description
   * @param {*} key
   * @returns {Boolean} result
   */
  static async DeleteItem(key) {
    try {
      const result = await this.GetInstance().memCachierClient.delete(key);

      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
