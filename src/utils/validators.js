export const parseBloodPressure = (reading, fieldName) => {
  if (!reading) return null;
  const match = reading.trim().match(/^(\d{2,3})\/(\d{2,3})$/);
  if (!match) throw new Error(`${fieldName} must be in format like 120/80`);
  const systolic = parseInt(match[1]);
  const diastolic = parseInt(match[2]);
  if (systolic < 50 || systolic > 300) throw new Error(`${fieldName} systolic value is out of range`);
  if (diastolic < 30 || diastolic > 200) throw new Error(`${fieldName} diastolic value is out of range`);
  let status;
  if (systolic >= 180 || diastolic >= 120) status = 'High';
  else if (systolic >= 140 || diastolic >= 90) status = 'Stage 2';
  else if (systolic >= 130 || diastolic >= 80) status = 'Slightly High';
  else status = 'Normal';
  return { systolic, diastolic, status };
};

export const parseDiabetes = (value, fieldName) => {
  if (!value && value !== 0) return null;
  const level = parseFloat(value);
  if (isNaN(level)) throw new Error(`${fieldName} must be a number`);
  if (level < 20 || level > 600) throw new Error(`${fieldName} is out of range (20–600 mg/dL)`);
  let status;
  if (fieldName === 'Fasting') {
    if (level < 100) status = 'Normal';
    else if (level < 126) status = 'Borderline';
    else status = 'High';
  } else {
    if (level < 140) status = 'Normal';
    else if (level < 200) status = 'Borderline';
    else status = 'High';
  }
  return { level, unit: 'mg/dL', status };
};

export const parseBodyTemp = (value, fieldName) => {
  if (!value && value !== 0) return null;
  const temp = parseFloat(value);
  if (isNaN(temp)) throw new Error(`${fieldName} must be a number`);
  if (temp < 30 || temp > 45) throw new Error(`${fieldName} is out of range (30–45 °C)`);
  let status;
  if (temp < 36.1) status = 'Low';
  else if (temp <= 37.2) status = 'Normal';
  else if (temp <= 38.0) status = 'Slightly High';
  else status = 'High';
  return { temp, unit: '°C', status };
};