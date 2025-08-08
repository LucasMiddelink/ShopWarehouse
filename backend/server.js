import app from './src/app.js';
import pool from './src/config/database.js';

const port = process.env.PORT;

// Connection test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected to shopwarehouse');
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})