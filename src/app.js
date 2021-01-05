import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import pingmydyno from 'pingmydyno';
import { verifyWebhook, postWebhook } from './utils/fb-webhook';

dotenv.config();

const { PORT: APP_PORT, HEROKU_APP_URL } = process.env;
const PORT = Number.parseInt(APP_PORT, 10) || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hello, World!',
  });
});

app.get('/webhook', verifyWebhook);
app.post('/webhook', postWebhook);

if (!module.parent) {
  app.listen(PORT, () => {
    pingmydyno(`${HEROKU_APP_URL}`);
    console.log(`App is live on ${PORT}`);
  });
}

export default app;
