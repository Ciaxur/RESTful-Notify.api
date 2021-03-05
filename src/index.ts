// Library Imports
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

// Route Imports
import { Notify } from './Routes';

// Setup App
const app = express();
app.use(express.json({
  limit: '200kb',
}));

// Initialize Middlewares
app.use(helmet());
app.use(morgan('short'));

// Register Routes
app.use('/api/v1/notify', Notify);

// START
app.listen(3000, () => {
  console.log('Express Running...');
});