// import dotenv from 'dotenv';
// dotenv.config()
import express from 'express';
import cors from 'cors';


//console.log("DOTNET:", JSON.stringify(process.env.DOTNET_API_URL));
//import dotenv from 'dotenv';

import authRoutes        from './routes/auth.routes.js';
import userRoutes        from './routes/user.routes.js';
import measurementRoutes from './routes/measurement.routes.js';
import doctorRoutes      from './routes/doctors.routes.js';
import emergencyRoutes   from './routes/emergency.routes.js';
import aiRoutes          from './routes/ai.routes.js';
import homeRoutes        from './routes/home.routes.js';
import commentRoutes     from './routes/comments.routes.js';


const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/emergency',    emergencyRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/home',         homeRoutes);
app.use('/api/comments',     commentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Healthcare API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});
// app.use((req, res, next) => {
//   console.log("الطلب كامل هو:", req.originalUrl);
//   next();
// });

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

//   Global Error Handler 
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong on our side!' });
// });
export default app;