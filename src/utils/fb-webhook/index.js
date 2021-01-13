import dotenv from 'dotenv';
import processMessage from '../wit-ai';
import { retrieveFBUserProfile } from './util';

dotenv.config();
const { VERIFY_TOKEN } = process.env;

/**
 * @description Route handler function that handles FB Messenger webhook verification
 * @param {Object} req Express HTTP Request Object
 * @param {Object} res Express HTTP Response Object
 */
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

/**
 * @description Route handler function that allows FB Messenger send Webhook events & users messages
 * @param {Object} req Express HTTP Request Object
 * @param {Object} res Express HTTP Response Object
 */
const postWebhook = (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;
  messagingEvents.forEach((event) => {
    const sender = event.sender.id;

    if (event.message && event.message.text) {
      const { text } = event.message;
      processMessage(text, sender);
    } else if (event.postback && event.postback.payload === 'GET_STARTED_PAYLOAD') {
      const { first_name: firstName } = retrieveFBUserProfile(sender);
      const msg = `Hi ${firstName},
      I am Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market`;

      processMessage(msg, sender);
    }
  });

  res.sendStatus(200);
};

export { verifyWebhook, postWebhook };
