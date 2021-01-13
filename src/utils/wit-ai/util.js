import { sendTextMessage } from '../fb-webhook/util';

/**
 * @description
 * @param {*} traits
 */
const analyzeTraits = (traits) => {
  let confidence = 0;
  let trait;
  let value;

  Object.keys(traits).forEach((key) => {
    if (traits[key][0].confidence > confidence) {
      confidence = traits[key][0].confidence;
      trait = key;
      value = traits[key][0].value;
    }
  });

  return { trait, value };
};

/**
 * @description
 * @param {*} intent
 */
const analyzeIntent = (intent) => {
  if (intent.length === 1) {
    return intent[0].name;
  }
};

/**
 * @description
 * @param {*} param
 * @param {*} sender
 */
const processResponse = ({ entities, intents, traits }, sender) => {
  const intent = analyzeIntent(intents);
  const { trait, value } = analyzeTraits(traits);

  switch (intent) {
    case 'greetings':
      if (trait === 'wit$greetings') {
        sendTextMessage(sender, `Hi, how can I be of help?`);
      } else if (trait === 'wit$sentiment') {
        const response = value === 'positive' ? 'Glad I could be of help.' : 'Hmm.';
        sendTextMessage(sender, response);
      }
      break;

    case 'check_stock':
    case 'stock_news':
    case 'show_my_portfolio':
    case 'market_news':
    case 'check_stock_price':
    case 'create_portfolio':
    case 'delete_portfolio':
    case 'show_crypto_prices':
    case 'show_crypto_holdings':
    case 'portfolio_news':
    case 'convert_currency':
    case 'check_crypto_coin':
      sendTextMessage(sender, `Hi, this feature ${intent} isn't available for now. We are currently worling on it. Please bear with us.`);
      break;

    default:
      sendTextMessage(
        sender,
        `Sorry,  I don't understand ${intent} what you are trying to do.
      Check Portfolio? Check Stock Price? Check Crypto prices?`,
      );
      break;
  }
};

export { analyzeTraits, analyzeIntent, processResponse };
