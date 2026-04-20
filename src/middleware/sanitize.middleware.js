// const removeSensitive = (obj) => {
//   if (Array.isArray(obj)) {
//     return obj.map(removeSensitive);
//   }

//   if (obj !== null && typeof obj === "object") {
//     const newObj = {};

//     for (const key in obj) {
//       // ❌ امنع الحاجات الحساسة
//       if (["password", "passwordHash"].includes(key)) continue;

//       newObj[key] = removeSensitive(obj[key]);
//     }

//     return newObj;
//   }

//   return obj;
// };

// export const sanitizeResponse = (req, res, next) => {
//   const oldJson = res.json;

//   res.json = function (data) {
//     const cleaned = removeSensitive(data);
//     return oldJson.call(this, cleaned);
//   };

//   next();
// };