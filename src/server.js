import mongoose from 'mongoose';
import app from './app';

process.on('uncaughtException', (error) => {
  console.log(error.message);
  process.exit(1);
});
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('database connect suceesfully!'));

const server = app.listen(port, () => {
  console.log(`Listening on 127.0.0.1 : ${port}`);
});

//handle unhandled promise rejection error
process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
