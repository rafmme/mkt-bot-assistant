import { Wit, log } from 'node-wit';
import dotenv from 'dotenv';
import { processResponse, sendTextMessage } from './util';

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
  try {
    processResponse(await wit.message(text), sender);
  } catch (error) {
    console.log(error);
    console.error('Oops! Got an error from Wit: ', error.stack || error);
  } finally {
    sendTextMessage(sender, `Sorry, I can't process your request now. My house is currently not in order`);
  }
};

export default processMessage;
