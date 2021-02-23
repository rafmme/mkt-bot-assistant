/* eslint-disable no-await-in-loop */
import cron from 'node-cron';
import dotenv from 'dotenv';
import FBGraphAPIRequest from '../fb_messenger/graphapi_requests';
import Util from '../utils';
import StockAPI from '../stock_apis';

dotenv.config();

const { TZ, TEST_USER1, TEST_USER2 } = process.env;

/**
 * @class
 * @classdesc
 */
export default class Cron {
  /**
   * @static
   * @description
   * @param {} schedule
   * @param {} timezone
   */
  static SendDailyNewsUpdate(schedule, timezone = TZ) {
    const users = [TEST_USER1, TEST_USER2];

    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          const marketNews = await StockAPI.GetGeneralMarketNewsFromYahooFinance();
          const news = Util.convertAPIResponseToMessengerList(marketNews);

          for (let index = 0; index < users.length; index += 1) {
            const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(users[index]);
            await FBGraphAPIRequest.SendTextMessage(users[index], `👋🏾 Hi ${firstName}, here is your Market news update 📰 for today. Enjoy.🙂`, 'CONFIRMED_EVENT_UPDATE');

            for (let i = 0; i < news.length; i += 10) {
              const newsList = news.slice(i, i + 10);
              FBGraphAPIRequest.CreateMessengerListOptions(users[index], newsList);
            }
          }
        },
        {
          timezone,
        },
      );
      return task;
    }
    throw new Error(`${schedule} is not valid`);
  }

  /**
   * @static
   * @description
   */
  static StartCronJobs() {
    this.SendDailyNewsUpdate('0 4 * * Monday-Friday').start();
  }
}
