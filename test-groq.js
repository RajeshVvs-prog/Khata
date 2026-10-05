require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  console.log('Testing Groq API...');
  console.log('API Key:', process.env.GROQ_API_KEY ? 'Found' : 'Missing');
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: 'Say hello in one sentence' }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 50,
    });

    console.log('✓ Success!');
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.error);
  }
}

testGroq();
