import express from 'express';
import { formatDate } from '@repo/utils';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`Hello World! Server time: ${formatDate(new Date())}`);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
