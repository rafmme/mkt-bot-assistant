/**
 * @description
 * @param {*} param0
 */
export default ({ type, url, payload, title }) => {
  let button;

  switch (type) {
    case 'web_url':
      button = {
        type,
        url,
        title,
      };
      break;

    case 'postback':
      button = {
        type,
        title,
        payload,
      };
      break;

    default:
      break;
  }

  return button;
};
