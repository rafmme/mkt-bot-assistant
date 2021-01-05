import request from 'request';
import dotenv from 'dotenv';

dotenv.config();
const { VERIFY_TOKEN, FB_PAGE_ACCESS_TOKEN, SEND_API } = process.env;

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

const sendTextMessage = (sender, text) => {
  const messageData = {
    text: text,
  };

  request(
    {
      url: SEND_API,
      qs: {
        access_token: FB_PAGE_ACCESS_TOKEN,
      },
      method: 'POST',
      json: {
        recipient: {
          id: sender,
        },
        message: messageData,
      },
    },
    (error, response, body) => {
      if (error) {
        console.log('Error:', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    },
  );
};

const postWebhook = (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;
  for (let i = 0; i < messagingEvents.length; i += 1) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const { text } = event.message;
      sendTextMessage(sender, `${text}!`);
    }
  }
  res.sendStatus(200);
};

export { verifyWebhook, postWebhook };
