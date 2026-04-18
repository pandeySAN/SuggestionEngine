import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testOpenAI = async () => {
  console.log('Testing OpenAI connection...');
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10));

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\nMaking test API call...');
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Changed model
        messages: [
            {
            role: 'user',
            content: 'Say "Hello, OpenAI is working!" in JSON format with a message field.',
            },
        ],
        response_format: { type: 'json_object' },
        });

    console.log('\n✅ OpenAI API is working!');
    console.log('Response:', completion.choices[0].message.content);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ OpenAI API Error:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    process.exit(1);
  }
};

testOpenAI();