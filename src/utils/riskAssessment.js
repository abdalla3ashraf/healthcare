export const calculateRiskLevel = (measurements) => {
  let riskScore = 0;

  if (measurements.bloodPressure) {
    const { systolic, diastolic } = measurements.bloodPressure;
    if (systolic >= 180 || diastolic >= 120)     riskScore += 3;
    else if (systolic >= 140 || diastolic >= 90) riskScore += 2;
    else if (systolic >= 130 || diastolic >= 80) riskScore += 1;
  }

  if (measurements.diabetes) {
    const { fasting } = measurements.diabetes;
    if (fasting >= 126)      riskScore += 3;
    else if (fasting >= 100) riskScore += 2;
  }

  if (measurements.bodyTemp) {
    const { temp } = measurements.bodyTemp;
    if (temp >= 39)        riskScore += 3;
    else if (temp >= 38)   riskScore += 2;
    else if (temp >= 37.3) riskScore += 1;
  }

  let level, message;
  if (riskScore >= 5) {
    level = 'High';
    message = 'Your vitals indicate high risk. Please seek medical attention immediately.';
  } else if (riskScore >= 2) {
    level = 'Medium';
    message = 'Some vitals are slightly abnormal. Monitor your condition closely.';
  } else {
    level = 'Low';
    message = 'Your vitals appear normal';
  }

  return { level, message, score: riskScore };
};

export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};