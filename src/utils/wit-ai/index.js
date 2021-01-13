import { Wit, log } from 'node-wit';
import dotenv from 'dotenv';
import { processResponse } from './util';
import { sendTextMessage } from '../fb-webhook/util';

dotenv.config();
const { WIT_TOKEN } = process.env;

const wit = new Wit({
  accessToken: WIT_TOKEN,
  logger: new log.Logger(log.INFO),
});

/**
 *@description
 * @param {*} text
 * @param {*} sender
 */
const processMessage = async (text, sender) => {
  let err = false;

  try {
    return processResponse(await wit.message(text), sender);
  } catch (error) {
    if (error) {
      err = true;
    }

    console.error('Oops! Got an error from Wit: ', error.stack || error);
  } finally {
    if (err === true) {
      sendTextMessage(sender, `Sorry, I can't process your request now. My house is currently not in order`);
    }
    err = false;
  }
};

export default processMessage;
