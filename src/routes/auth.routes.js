import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const router = express.Router();
// console.log("DOTNET inside route:", process.env.DOTNET_API_URL);

const DOTNET = process.env.DOTNET_API_URL;

const generateToken = (user, rememberMe = false) =>
  jwt.sign(
    { id: user.id, email: user.emailAddress || user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '1d' }
  );

const err = (res, error) => {
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || error.message || 'Server error';
  return res.status(status).json({ message });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    if (!fullName || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const { data: user } = await axios.post(`${DOTNET}/api/Users/register`, {
      fullName,
      emailAddress: email,
      password,
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'Account created successfully', token, user });
  } catch (error) { err(res, error); }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

     const response = await axios.post(`${DOTNET}/api/Users/login`, {
      emailAddress: email,
      password,
        });
       const data = response.data; 

        const token = data.token;
        res.status(200).json({
      message: data.message,
      token
       });
       } catch (error) {
    err(res, error);
      }
});

// POST /api/auth/google

// router.post('/google', async (req, res) => {
//   try {

//     console.log(req.body);

//     const { token: googleToken } = req.body;

//     if (!googleToken) {
//       return res.status(400).json({
//         message: 'No token provided'
//       });
//     }

//     const client = new OAuth2Client(
//       process.env.GOOGLE_CLIENT_ID
//     );

//     await client.verifyIdToken({
//       idToken: googleToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     // send to .NET
//     const { data: user } = await axios.post(
//       `${DOTNET}/api/Users/social-login`,
//       {
//         provider: 'Google',
//         token: googleToken,
//       }
//     );

//     const jwtToken = generateToken(user);

//     return res.status(200).json({
//       message: 'Google login successful',
//       token: jwtToken,
//       user
//     });

//   } catch (error) {

//     console.error('GOOGLE ERROR FULL:', error);

//     return res.status(500).json({
//       message: 'Google auth failed',
//       error: error.response?.data || error.message
//     });

//   }
// });
router.post('/google', async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken)
      return res.status(400).json({ message: 'No token provided' });

    // لو id_token بيبدأ بـ eyJ
    if (googleToken.startsWith('eyJ')) {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      ticket.getPayload();
    } else {
      // access_token — تحقق من Google
      await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${googleToken}` } }
      );
    }

    // بعت للـ .NET
    const { data: user } = await axios.post(`${DOTNET}/api/Users/social-login`, {
      provider: 'Google',
      token: googleToken,
    });

    const jwtToken = generateToken(user);
    res.status(200).json({ message: 'Google login successful', token: jwtToken, user });

  } catch (error) {
    console.error('Google error:', error.message);
    res.status(500).json({
      message: 'Google authentication failed',
      error: error.response?.data || error.message
    });
  }
});






// POST /api/auth/facebook
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    const fbRes = await axios.get(
      `https://graph.facebook.com/${userID}?fields=id,name,email&access_token=${accessToken}`
    );
    if (fbRes.data.error) return res.status(401).json({ message: 'Invalid Facebook token' });

    const { data: user } = await axios.post(`${DOTNET}/api/Users/social-login`, {
      provider: 'Facebook',
      token: accessToken,
    });

    const token = generateToken(user);
    res.status(200).json({ message: 'Facebook login successful', token, user });
  } catch (error) { err(res, error); }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    await axios.post(`${DOTNET}/api/Users/forgot-password`, { emailAddress: email });
    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) { err(res, error); }
});

export default router;