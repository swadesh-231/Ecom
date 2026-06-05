import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Ecom API is running 🛒' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
