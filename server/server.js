require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.use('/api/tasks', require('./src/routes/taskRoutes'));

app.get('/', (req, res) => {
  res.send('TaskFlow API is running with MongoDB Atlas...');
});

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./src/config/prisma');
    await prisma.$runCommandRaw({ ping: 1 });
    res.status(200).json({ status: 'ok', database: 'connected to MongoDB Atlas' });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
      hint: 'Please ensure your MongoDB Atlas DATABASE_URL in server/.env is valid and IP access is configured in Atlas.'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
