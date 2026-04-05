const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Import Routes
const chatRoutes = require('./routes/chat.routes');
const taskRoutes = require('./routes/task.routes');
const studyRoutes = require('./routes/study.routes');
const userRoutes = require('./routes/user.routes');

// Use Routes
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Sam is online ✅', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`\n🤖 Sam Assistant running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});
