import 'dotenv/config';
import { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import router from './routes/index.route';
import cookie from 'cookie-parser'
const app: Express = express();
const PORT = process.env.APP_PORT || 3000;


app.use(express.json());
app.use(cors());
app.use('/api/v1', router)
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
