import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// بعت SMS لأي رقم
export const sendSMS = async (to, body) => {
  const message = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to,
  });

  return {
    sid: message.sid,
    to: message.to,
    status: message.status,
  };
};