import express from 'express';
import cors from 'cors';
import logger from 'morgan';
// import path from 'path'
import "dotenv/config";

import authRouter from "./routes/api/auth.js";
import contactsRouter from './routes/api/contacts.js';
// import dotenv from 'dotenv';
// dotenv.config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// app.use('/public', express.static(path.join('./public')))

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);

const jsonErrorHandler = (err, req, res) => {
  res.status(err.status).json({ error: err.status, message: err.message });
}
app.use(jsonErrorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message: `${message}` });
});

export default app;
