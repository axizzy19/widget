import express from 'express';
import 'dotenv/config' ;

const { PORT = 3000 } = process.env;

const app = express();

app.listen(PORT, () => {
  console.log("Сейчас работает порт 3000")
});