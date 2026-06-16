// Minimal provider wrapper — integrate OpenAI / Gemini here
exports.sendMessage = async (user, message) => {
  // For now return an echo; replace with real API call to OpenAI/Gemini
  return `Echo: ${message}`;
};
