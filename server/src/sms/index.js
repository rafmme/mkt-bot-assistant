import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER, MN } = process.env;
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * @description Function to send sms with twilio
 * @param {String} body
 * @param {String} from
 * @param {String} to
 */
const sendSMS = async (body, from, to) => {
  try {
    await client.messages.create({
      body,
      from: from || TWILIO_NUMBER,
      to: to || MN,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendSMS;
