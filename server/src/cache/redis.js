/* eslint-disable consistent-return */
import redis from 'redis';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @class
 * @classdesc
 */
export default class RedisCache {
  /**
   * @constructor
   * @description
   */
  constructor() {
    const { REDIS_URL } = process.env;

    if (typeof RedisCache.instance === 'object') {
      return RedisCache.instance;
    }

    this.redisClient = redis.createClient(REDIS_URL);

    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
    this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
    this.hmsetAsync = promisify(this.redisClient.hmset).bind(this.redisClient);
    this.hgetallAsync = promisify(this.redisClient.hgetall).bind(this.redisClient);
    this.expire = promisify(this.redisClient.expire).bind(this.redisClient);
    this.del = promisify(this.redisClient.del).bind(this.redisClient);

    this.redisClient.on('error', (err) => {
      console.error(err);
    });

    RedisCache.instance = this;
    return this;
  }

  /**
   * @static
   * @description
   */
  static GetInstance() {
    const redisCacheObject = new this();
    return redisCacheObject;
  }

  /**
   * @static
   * @description
   * @param {*} key
   * @returns {} item
   */
  static async GetItem(key) {
    try {
      const item = await this.GetInstance().getAsync(key);

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
      await this.GetInstance().setAsync(key, value);
      await this.GetInstance().expire(key, ttl);
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
      const item = await this.GetInstance().hgetallAsync(key);

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
      await this.GetInstance().hmsetAsync(key, value);
      await this.GetInstance().expire(key, ttl);
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
      const result = await this.GetInstance().del(key);

      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
