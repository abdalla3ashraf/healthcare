import express from 'express';
import axios from 'axios';
import { spawn } from 'child_process';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const AI = process.env.AI_API_URL;

// POST /api/ai/chat
// router.post('/chat', protect, async (req, res) => {
//   try {
//     const { message, history = [] } = req.body;
//     if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });
//     if (message.length > 1000) return res.status(400).json({ message: 'Message too long (max 1000)' });

//     const { data: aiResponse } = await axios.post(`${AI}/api/chat`, {
//       message, history,
//       userContext: { userId: req.user.id, email: req.user.email },
//     });
//     res.status(200).json({ reply: aiResponse.reply, timestamp: new Date().toISOString() });
//   } catch (error) {
//     res.status(500).json({ message: 'AI service unavailable' });
//   }
// });

// GET /api/ai/suggestions
router.get('/suggestions', protect, (req, res) => {
  res.status(200).json({
    suggestions: [
      'What are COVID symptoms?',
      'How to lower blood pressure?',
      'Best foods for diabetes?',
      'When to see a doctor?',
    ],
  });
});


const runPythonModel = (vitals) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'src/ai/ai_logicen.py',
      JSON.stringify(vitals)
    ]);

    let output = '';
    let errorMsg = '';

    python.stdout.on('data', (data) => {
      console.log("PYTHON OUT:", data.toString()); // 👈 مهم
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.log("PYTHON ERR:", data.toString()); // 👈 مهم
      errorMsg += data.toString();
    });

    python.on('close', (code) => {
      console.log("PYTHON EXIT CODE:", code);

if (code !== 0) {
  return reject(errorMsg || "Python process failed");
}
      try {
        const parsed = JSON.parse(output);
        resolve(parsed);
      } catch (err) {
        reject("Invalid JSON from Python: " + output);
      }
    });
  });
};
// const risk_level = calculateRiskFromVitals(vitals);
// console.log('Risk level calculated:', risk_level); // أضيف ده
// const calculateRiskFromVitals = (vitals) => {
//   let score = 0;

//   if (vitals.systolic_bp >= 180 || vitals.diastolic_bp >= 120) score += 3;
//   else if (vitals.systolic_bp >= 140 || vitals.diastolic_bp >= 90) score += 2;
//   else if (vitals.systolic_bp >= 130 || vitals.diastolic_bp >= 80) score += 1;

//   if (vitals.glucose >= 300) score += 3;
//   else if (vitals.glucose >= 200) score += 2;
//   else if (vitals.glucose >= 140) score += 1;

//   if (vitals.temperature >= 39) score += 3;
//   else if (vitals.temperature >= 38) score += 2;
//   else if (vitals.temperature >= 37.3) score += 1;

//   if (vitals.spo2 < 90) score += 3;
//   else if (vitals.spo2 < 94) score += 2;
//   else if (vitals.spo2 < 96) score += 1;

//   if (vitals.heart_rate >= 120 || vitals.heart_rate <= 40) score += 3;
//   else if (vitals.heart_rate >= 100) score += 2;

//   if (score >= 6) return 3;
//   if (score >= 4) return 2;
//   if (score >= 2) return 1;
//   return 0;
// };

router.post('/chat', protect, async (req, res) => {
  try {
    console.log('AI chat called, body:', req.body);
    const { message } = req.body;

    const vitals = {
      age:          req.body.age || 30,
      gender:       req.body.gender || 1,        // 1 = male, 0 = female
      diabetes:     req.body.diabetes || 0,
      hypertension: req.body.hypertension || 0,
      heart_disease:req.body.heart_disease || 0,
      glucose:      req.body.glucose || 90,
      systolic_bp:  req.body.systolic_bp || 120,
      diastolic_bp: req.body.diastolic_bp || 80,
      heart_rate:   req.body.heart_rate || 75,
      temperature:  req.body.temperature || 36.5,
      spo2:         req.body.spo2 || 98,
    };

    const result = await runPythonModel(vitals);

    const replies = {
      0: 'Low risk. Your vitals appear normal. Maintain healthy habits.',
      1: 'Medium risk. Some vitals are abnormal. Consult your doctor soon.',
      2: 'High risk. Seek immediate medical attention or call 123.',
      3: 'Critical risk. Call emergency services immediately!',
    };

    res.status(200).json(result)
    //   {
    //   reply:      replies[result.risk_level] || 'Unable to analyze.',
    //   risk_level: result.risk_level,
    //   timestamp:  new Date().toISOString(),
    // };

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.toString() });
  }
});
export default router;