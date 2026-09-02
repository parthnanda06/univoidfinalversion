const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'qwen/qwen3.8-27b',
    });
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

main();
