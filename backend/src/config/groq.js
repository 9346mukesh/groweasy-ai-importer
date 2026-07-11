const Groq = require("groq-sdk");

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return null;

  return new Groq({
    apiKey,
  });
}

function getGroqModel() {
  return process.env.AI_MODEL || DEFAULT_MODEL;
}

function isGroqConfigured() {
  return !!process.env.GROQ_API_KEY;
}

module.exports = {
  getGroqClient,
  getGroqModel,
  isGroqConfigured,
};