import app from './src/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening to Port ${PORT}`);
});
