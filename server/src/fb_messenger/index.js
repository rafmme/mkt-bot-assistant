import dotenv from 'dotenv';
import WitAIHelper from '../wit_ai';
import FBGraphAPIRequest from './graphapi_requests';

export default class WebhookRouteHandler {
  /**
   * @static
   * @description Route handler function that handles FB Messenger webhook verification
   * @param {Object} req Express HTTP Request Object
   * @param {Object} res Express HTTP Response Object
   */
  static VerifyWebhook(req, res) {
    dotenv.config();
    const { VERIFY_TOKEN } = process.env;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  /**
   * @static
   * @description Route handler function that allows FB Messenger send Webhook events & users messages
   * @param {Object} req Express HTTP Request Object
   * @param {Object} res Express HTTP Response Object
   */
  static async PostWebhook(req, res) {
    const messagingEvents = req.body.entry[0].messaging;
    messagingEvents.forEach(async (event) => {
      const sender = event.sender.id;

      if (event.message && event.message.text) {
        const { text } = event.message;
        await WitAIHelper.ProcessMessage(text, sender);
      } else if (event.postback) {
        await FBGraphAPIRequest.HandlePostbackPayload(sender, event.postback.payload);
      }
    });

    res.sendStatus(200);
  }
}
