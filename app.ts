import 'dotenv/config';
import { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import router from './routes/index.route';
import { expressLogger, errorLogger, appLogger } from './util/logger';
const app = express();
const PORT = process.env.APP_PORT || 3000;


app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(expressLogger);
app.use(errorLogger);
app.use('/uploads', express.static('public/uploads')); //for static directory


app.use('/api/v1', router)

app.get('/500', (req, res) => {
  res.sendStatus(500);
})

app.get('/400', (req, res) => {
  res.sendStatus(400);
})

app.get('/error', (req, res) => {
  appLogger.error('Fuckk');
})

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
