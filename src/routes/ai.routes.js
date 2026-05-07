import express from 'express';
import axios from 'axios';
import { spawn } from 'child_process';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
// const AI = process.env.AI_API_URL;


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
      console.log("PYTHON OUT:", data.toString()); //  مهم
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.log("PYTHON ERR:", data.toString()); //  
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

/// code 7oda
router.post('/chat', protect, async (req, res) => {
  try {
    const { data: aiResponse } = await axios.post(
  'https://pulse-key-ai-model-g66v-e87rhcise.vercel.app/predict',
  {
    age:           req.body.age          || 30,
    gender:        req.body.gender       || 1,
    diabetes:      req.body.diabetes     || 0,
    hypertension:  req.body.hypertension || 0,
    heart_disease: req.body.heart_disease|| 0,
    glucose_mg_dl: req.body.glucose      || 90,
    systolic_bp:   req.body.systolic_bp  || 120,
    diastolic_bp:  req.body.diastolic_bp || 80,
    heart_rate:    req.body.heart_rate   || 75,
    temperature_c: req.body.temperature  || 36.5,
    spo2:          req.body.spo2         || 98,
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    }
  }
);

    const replies = {
      0: 'Low risk. Your vitals appear normal. Maintain healthy habits.',
      1: 'Medium risk. Some vitals are slightly abnormal. Monitor closely.',
      2: 'High risk. Consult your doctor soon.',
      3: 'Critical risk. Seek immediate medical attention or call 123!',
    };

    const risk_level = aiResponse.risk_level ?? aiResponse.prediction ?? 0;

    res.status(200).json({
  reply:      aiResponse.reply,
  risk_level: aiResponse.risk_level,
  timestamp:  new Date().toISOString(),
});

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});




// POST /api/ai/chat-with-context
router.post('/chat-with-context', protect, async (req, res) => {
  try {
    const { message, report_context } = req.body;

    if (!message)
      return res.status(400).json({ message: 'Message is required' });

    const { data: aiResponse } = await axios.post(
      'https://pulse-key-ai-model-g66v-e87rhcise.vercel.app/predict',
      {
        message,
        report_context,
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      reply:      aiResponse.reply || aiResponse.response || aiResponse.message,
      timestamp:  new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

 export default router;