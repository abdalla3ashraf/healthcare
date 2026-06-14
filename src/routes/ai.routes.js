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
router.post('/predict', protect, async (req, res) => {
  try {
    // الفرونت بيبعت جوا data أو مباشرة
    const body = req.body.data || req.body;

    const { data: aiResponse } = await axios.post(
      'https://fearless-solace-production-cf1a.up.railway.app/predict',
      {
        // بعت للـ Railway بنفس الـ format اللي بيقبله
        data: {
          age:           body.age           || 30,
          gender:        body.gender        || 1,
          diabetes:      body.diabetes      || 0,
          hypertension:  body.hypertension  || 0,
          heart_disease: body.heart_disease || 0,
          glucose_mg_dl: body.glucose_mg_dl || body.glucose || 90,
          systolic_bp:   body.systolic_bp   || 120,
          diastolic_bp:  body.diastolic_bp  || 80,
          heart_rate:    body.heart_rate    || 75,
          temperature_c: body.temperature_c || body.temperature || 36.5,
          spo2:          body.spo2          || 98,
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    res.status(200).json({
      reply:      aiResponse.label || aiResponse.reply,
      risk_level: aiResponse.risk_level,
      status:     aiResponse.status,
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

    if (!message) {
      return res.status(400).json({
        message: 'Message is required'
      });
    }

    console.log(
      'Sending to Railway:',
      JSON.stringify(
        {
          message,
          report_context
        },
        null,
        2
      )
    );

    const { data: aiResponse } = await axios.post(
      'https://fearless-solace-production-cf1a.up.railway.app/chat',
      {
        message,
        report: report_context, // مهم
        report_context: report_context // مهم
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(
      'Railway response:',
      JSON.stringify(aiResponse, null, 2)
    );

    return res.status(200).json({
      reply:
        aiResponse.reply ||
        aiResponse.response ||
        aiResponse.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {

    console.error(
      'AI Chat Error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: 'AI service error',
      error: error.response?.data || error.message
    });
  }
});

 export default router;