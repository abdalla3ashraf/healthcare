// import jwt from 'jsonwebtoken';

// export const protect = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token)
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'No token' });

  req.user = { token }; // بس كده

  next();
};