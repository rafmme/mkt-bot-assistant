import axios from 'axios';
import dotenv from 'dotenv';
import { firstButtons, menuButtonTemplate, secondButtons } from './messenger_templates/button/menu';
// import processMessage from '../wit-ai';

dotenv.config();
const { FB_PAGE_ACCESS_TOKEN, SEND_API } = process.env;

/**
 * @description
 * @param {*} param
 * @param {*} message
 * @returns
 */
const makeHTTPRequestToGraphAPI = async ({ url, qs, method, sender, key }, message) => {
  try {
    const response = await axios({
      method,
      url,
      params: qs,
      data: {
        recipient: {
          id: sender,
        },
        [key]: message,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
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

  return makeHTTPRequestToGraphAPI(data);
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
 * @param {*} imageUrl
 * @paramsß
 */
const sendAttachment = async (sender, { type, imageUrl, templateObject }) => {
  let messageData;

  switch (type) {
    case 'image':
      messageData = {
        attachment: {
          type,
          payload: {
            url: imageUrl,
            is_reusable: true,
          },
        },
      };
      break;

    case 'template':
      messageData = {
        attachment: templateObject,
      };
      break;

    default:
      break;
  }

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
  await makeHTTPRequestToGraphAPI(data, messageData);
};

/**
 * @description
 * @param {String} firstName
 * @returns {String} msg
 */
const getStartedGreeting = async (sender) => {
  const { first_name: firstName } = await retrieveFBUserProfile(sender);
  const msg = firstName
    ? `Hi ${firstName}, I am Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market`
    : 'Hi there, I am Lewis The Bot Assistant and I was created to help you keep an eye on the US Stock Market';

  await sendAttachment(sender, {
    type: 'template',
    templateObject: menuButtonTemplate(msg, firstButtons),
  });

  await sendAttachment(sender, {
    type: 'template',
    templateObject: menuButtonTemplate('OR', secondButtons),
  });
};

/**
 * @description
 * @param {*} sender
 * @param {*} postbackPayload
 */
const handlePostbackPayload = (sender, postbackPayload) => {
  switch (postbackPayload) {
    case 'GET_STARTED_PAYLOAD':
      getStartedGreeting(sender);
      break;
    default:
      // processMessage('Hey', sender);
      break;
  }
};

// eslint-disable-next-line prettier/prettier
export {
  sendTextMessage,
  makeHTTPRequestToGraphAPI,
  createSenderAction,
  retrieveFBUserProfile,
  sendAttachment,
  getStartedGreeting,
  handlePostbackPayload,
};
