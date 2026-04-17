import axios from 'axios';

const AI_API = process.env.AI_API_URL;

export const sendMessageToAI = async (message, conversationHistory, userContext) => {
  const response = await axios.post(`${AI_API}/api/chat`, {
    message,
    history: conversationHistory,
    userContext,
  });
  return response.data;
};