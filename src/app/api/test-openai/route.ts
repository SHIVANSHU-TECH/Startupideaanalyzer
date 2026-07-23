import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  try {
    console.log('Testing Groq API key...');
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GROQ_API_KEY is not set in environment variables'
      }, { status: 500 });
    }
    
    console.log('Groq API key exists, length:', apiKey.length);
    
    // Test if the key is valid by making a simple API call
    const groq = new Groq({
      apiKey: apiKey,
    });
    
    // Test with a very simple request
    console.log('Making test request to Groq...');
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, World!"'
        }
      ],
      max_tokens: 10
    });
    
    const content = response.choices[0]?.message?.content;
    console.log('Groq test response:', content);
    
    return NextResponse.json({
      success: true,
      message: 'Groq API key is valid',
      response: content
    });
  } catch (error: any) {
    console.error('Groq test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Groq API test failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}