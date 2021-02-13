import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import pingmydyno from 'pingmydyno';
import context from './graphql/context';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schemas';
import WebhookRouteHandler from './fb_messenger';

dotenv.config();

const { PORT: APP_PORT, HEROKU_APP_URL, PING_DYNO } = process.env;
const PORT = Number.parseInt(APP_PORT, 10) || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: true,
  playground: {
    settings: {
      'schema.polling.enable': false,
    },
  },
});

apolloServer.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hello, World!',
  });
});

app.get('/webhook', WebhookRouteHandler.VerifyWebhook);
app.post('/webhook', WebhookRouteHandler.PostWebhook);

if (!module.parent) {
  app.listen(PORT, () => {
    if (PING_DYNO && (PING_DYNO === 'yes' || PING_DYNO === 'allow' || PING_DYNO === 'true')) {
      pingmydyno(`${HEROKU_APP_URL}`, {
        onSuccess: () => {
          console.log('PINGED');
        },
      });
    }
    console.log(`App is live on ${PORT}`);
  });
}

export default app;
