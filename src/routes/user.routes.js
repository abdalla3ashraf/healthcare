import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const DOTNET = process.env.DOTNET_API_URL;
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const getToken = (req) => req.headers.authorization?.split(' ')[1];

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
    console.log("TOKEN:", getToken(req));
  try {
    const { data: user } = await axios.get(`${DOTNET}/api/Users/my-profile`, h(getToken(req)));
    res.status(200).json({ user: { ...user, age: calculateAge(user.birthDate) } });
//   } catch (error) {
//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || 'Server error',
//     });
//   }
  }catch (error) {
  console.log("🔥 FULL ERROR:", error.response?.data || error.message);
  console.log("STATUS:", error.response?.status);

  return res.status(error.response?.status || 500).json({
    message: error.response?.data?.message || error.message || 'Server error',
  });
}
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
const { emailAddress, nationalId, birthDate, city, gender, phoneNumber } = req.body;

    if (!nationalId || !birthDate || !city || !gender || !phoneNumber)
      return res.status(400).json({ message: 'All required fields must be filled' });
    if (!/^\d{14}$/.test(nationalId))
      return res.status(400).json({ message: 'National ID must be exactly 14 digits' });
    if (!/^01[0-2,5]{1}[0-9]{8}$/.test(phoneNumber))
      return res.status(400).json({ message: 'Invalid Egyptian phone number' });

    const { data: updatedUser } = await axios.post(
      `${DOTNET}/api/Users/complete-profile`,
      { emailAddress, nationalId, birthDate, gender, city, phoneNumber },
      h(getToken(req))
    );

    res.status(200).json({ 
        //message: 'Profile updated successfully',
         user: updatedUser });
//   } catch (error) {
//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || 'Server error',
//     });
//   }
  }catch (error) {
  console.log("🔥 DOTNET ERROR FULL:", error.response?.data);
  console.log("🔥 STATUS:", error.response?.status);
  console.log("🔥 SENT BODY:", error.config?.data);

  return res.status(error.response?.status || 500).json({
    message: error.response?.data || error.message
  });
}
});

export default router;