/* eslint-disable no-await-in-loop */
import cron from 'node-cron';
import dotenv from 'dotenv';
import FBGraphAPIRequest from '../fb_messenger/graphapi_requests';
import Util from '../utils';
import StockAPI from '../stock_apis';
import MemCachier from '../cache/memcachier';
import sendSMS from '../sms';

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
            await FBGraphAPIRequest.SendListRequest({ sender: users[index], text: `👋🏾 Hi ${firstName}, here is your Market news update 📰 for today. Enjoy.🙂`, list: news });
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
   * @param {} schedule
   * @param {} timezone
   */
  static SendUpcomingEarnings(schedule, timezone = TZ) {
    const users = [TEST_USER1, TEST_USER2];

    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          for (let index = 0; index < users.length; index += 1) {
            const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(users[index]);
            const text = `👋🏾 Hi ${firstName}, here's the upcoming earnings report for this week. Enjoy.🙂`;
            await FBGraphAPIRequest.SendEarningsCalendar(users[index], undefined, text);
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
   * @param {} schedule
   * @param {} timezone
   */
  static GetEarningsForTheWeek(schedule, timezone = TZ) {
    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          const fromDate = new Date();
          const from = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;

          const toDate = new Date(new Date().setDate(new Date(from).getDate() + 6));
          const to = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;

          await StockAPI.GetEarningsCalendar(from, to);
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
   * @param {} schedule
   * @param {} timezone
   */
  static SendEarningsForToday(schedule, timezone = TZ) {
    const users = [TEST_USER1, TEST_USER2];

    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          const data = await MemCachier.GetHashItem('er_calendar');

          const text = `Here's the earnings report for today.`;
          const earnings = Util.ParseEarningsCalendarData(data, true);

          for (let index = 0; index < users.length; index += 1) {
            if (typeof earnings === 'string') {
              await FBGraphAPIRequest.SendTextMessage(users[index], earnings);
              return;
            }

            await FBGraphAPIRequest.SendListRequest({ sender: users[index], text, list: earnings });
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
   * @param {} schedule
   * @param {} timezone
   */
  static SendHolidayReminder(schedule, timezone = TZ) {
    const users = [TEST_USER1, TEST_USER2];

    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          const holidays = await MemCachier.GetHashItem('holidays');
          const currentDate = new Date();
          const currentYearHolidays = holidays[`${currentDate.getFullYear()}`];

          for (let i = 0; i < currentYearHolidays.length; i += 1) {
            const { date, holiday } = currentYearHolidays[i];

            if (date === `${currentDate.toDateString()}`) {
              sendSMS(`Hi, this is to remind you that the Market will not open today ${date} in observation of the ${holiday}.\nHappy holidays!`);

              for (let index = 0; index < users.length; index += 1) {
                const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(users[index]);
                await FBGraphAPIRequest.SendTextMessage(
                  users[index],
                  `Hi ${firstName}, this is to remind you that the Market will not open today ${date} in observation of the ${holiday}.\nHappy holidays!`,
                );
              }
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
   * @param {} schedule
   * @param {} timezone
   */
  static ComingHolidayReminder(schedule, timezone = TZ) {
    const users = [TEST_USER1, TEST_USER2];

    if (cron.validate(schedule)) {
      const task = cron.schedule(
        schedule,
        async () => {
          const holidays = await MemCachier.GetHashItem('holidays');
          const currentDate = new Date();
          const currentYearHolidays = holidays[`${currentDate.getFullYear()}`];

          for (let i = 0; i < currentYearHolidays.length; i += 1) {
            const { date, holiday } = currentYearHolidays[i];

            if (date === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()) {
              sendSMS(`Hi, this is to notify you that the Market will not open tomorrow ${date} in observation of the ${holiday}.\nHappy holidays!`);

              for (let index = 0; index < users.length; index += 1) {
                const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(users[index]);
                await FBGraphAPIRequest.SendTextMessage(
                  users[index],
                  `Hi ${firstName}, this is to notify you that the Market will not open tomorrow ${date} in observation of the ${holiday}.\nHappy holidays!`,
                );
              }

              return;
            }

            if (`${currentDate.toDateString().split(' ')[0]}` === 'Fri' && date === new Date(new Date().setDate(new Date().getDate() + 3)).toDateString()) {
              sendSMS(`Hi, this is to notify you that the Market will not open this coming Monday ${date} in observation of the ${holiday}.\nHappy holidays!`);

              for (let index = 0; index < users.length; index += 1) {
                const { first_name: firstName } = await FBGraphAPIRequest.RetrieveFBUserProfile(users[index]);
                await FBGraphAPIRequest.SendTextMessage(
                  users[index],
                  `Hi ${firstName}, this is to notify you that the Market will not open this coming Monday ${date} in observation of the ${holiday}.\nHappy holidays!`,
                );
              }
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
    this.GetEarningsForTheWeek('0 1 * * 0').start();
    this.SendUpcomingEarnings('0 3 * * 0').start();
    this.SendEarningsForToday('0 2 * * Monday-Friday').start();
    this.SendHolidayReminder('0 3 * * Monday-Friday').start();
    this.ComingHolidayReminder('0 9 * * Monday-Friday').start();
  }
}
