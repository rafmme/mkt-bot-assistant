import dotenv from 'dotenv';
import request from 'request';

dotenv.config();
const { FB_PAGE_ACCESS_TOKEN, SEND_API } = process.env;

/**
 * @description
 * @param {*} param
 * @param {*} message
 * @returns
 */
const makeHTTPRequestToGraphAPI = ({ url, qs, method, sender, key }, message) => {
  let res;
  request(
    {
      url,
      qs,
      method: method,
      json: {
        recipient: {
          id: sender,
        },
        [key]: message,
      },
    },
    (error, response, body) => {
      res = response.body;
      if (error) {
        console.log('Error:', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    },
  );

  console.log(res);
  return res;
};

/**
 * @description function that handles creation senders action
 * @param {*} sender FB User's ID
 */
const createSenderAction = (sender) => {
  const messageData = 'typing_on';

  const data = {
    url: SEND_API,
    qs: {
      access_token: FB_PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    sender,
    key: 'sender_action',
  };

  return makeHTTPRequestToGraphAPI(data, messageData);
};

/**
 * @description function that handles sending messenger messeages to users
 * @param {*} sender FB User's ID
 * @param {String} text Text to send to FB User
 */
const sendTextMessage = (sender, text) => {
  const messageData = {
    text,
  };

  const data = {
    url: SEND_API,
    qs: {
      access_token: FB_PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    sender,
    key: 'message',
  };

  createSenderAction(sender);
  return makeHTTPRequestToGraphAPI(data, messageData);
};

/**
 * @description
 * @param {*} sender
 */
const retrieveFBUserProfile = (sender) => {
  const data = {
    url: `https://graph.facebook.com/${sender}`,
    qs: {
      fields: 'first_name,last_name,profile_pic',
      access_token: FB_PAGE_ACCESS_TOKEN,
    },
    method: 'GET',
  };

  makeHTTPRequestToGraphAPI(data);
};

export { sendTextMessage, makeHTTPRequestToGraphAPI, createSenderAction, retrieveFBUserProfile };
