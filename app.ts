import 'dotenv/config';
import { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import router from './routes/index.route';
import { expressLogger, errorLogger, appLogger } from './util/logger';
import { errorHandler } from './middlewares/errorHandler.middleware';
const app = express();
const PORT = process.env.APP_PORT || 3000;


app.use(express.json({ limit: '10mb' }));
//enable cors
app.use(cors());
//logger
app.use(expressLogger);
app.use(errorLogger);
//for uploading
app.use('/uploads', express.static('public/uploads')); //for static directory

//main route
app.use('/api/v1', router)

//wildcard
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

//middleware
app.use(errorHandler);


//listen
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
