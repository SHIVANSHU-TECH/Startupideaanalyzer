import Groq from 'groq-sdk';

// Lazy initialization of Groq client
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    // This should only be called on the server
    if (!apiKey) {
      throw new Error(
        'The GROQ_API_KEY environment variable is missing or empty. ' +
        'Please check your .env.local file and ensure the variable is properly set.'
      );
    }
    
    console.log('Initializing Groq client with API key');
    
    groqClient = new Groq({
      apiKey: apiKey,
    });
  }
  
  return groqClient;
}

interface IdeaAnalysisResult {
  successScore: number;
  marketAnalysis: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  financialProjections?: {
    revenueProjection: string;
    costEstimate: string;
    breakEvenAnalysis: string;
  };
  competitorAnalysis?: string;
  targetAudience?: string;
}

export async function analyzeStartupIdea(
  title: string,
  description: string,
  category: string
): Promise<IdeaAnalysisResult> {
  try {
    console.log('Starting Groq AI analysis for idea:', { title, category, descriptionLength: description.length });
    
    const groq = getGroqClient();
    
    const prompt = `
As an expert startup analyst and business consultant, analyze the following startup idea and provide a comprehensive evaluation:

**Startup Idea:**
Title: ${title}
Category: ${category}
Description: ${description}

Please provide a detailed analysis in the following JSON format:

{
  "successScore": <number between 0-100>,
  "marketAnalysis": "<comprehensive market analysis including market size, trends, competition level>",
  "swot": {
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
    "threats": ["<threat 1>", "<threat 2>", "<threat 3>"]
  },
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>", "<actionable recommendation 4>"],
  "financialProjections": {
    "revenueProjection": "<estimated revenue potential and timeline>",
    "costEstimate": "<initial investment and operational costs>",
    "breakEvenAnalysis": "<expected time to break even>"
  },
  "competitorAnalysis": "<analysis of existing competitors and market positioning>",
  "targetAudience": "<detailed description of target customer segments>"
}

Requirements:
- Be realistic and data-driven in your analysis
- Provide specific, actionable insights
- Consider current market trends and conditions
- Give a success score based on market viability, execution difficulty, and potential returns
- Focus on practical business considerations
- Respond ONLY with valid JSON, no other text
`;

    console.log('Sending request to Groq API...');
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Updated to a currently supported model
      messages: [
        {
          role: 'system',
          content: 'You are an expert startup analyst with 20+ years of experience in venture capital and business strategy. Provide thorough, realistic, and actionable startup analysis in valid JSON format. Respond ONLY with valid JSON, no other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('Received response from Groq API');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from AI service');
    }

    console.log('Groq raw response content length:', content.length);
    console.log('Groq raw response preview:', content.substring(0, 200) + '...');

    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      let jsonString = content.trim();
      console.log('Processing JSON string, starts with:', jsonString.substring(0, 50));
      
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        console.log('Extracted from json markdown block');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        console.log('Extracted from markdown block');
      }
      
      console.log('Final JSON string length:', jsonString.length);
      console.log('Final JSON string preview:', jsonString.substring(0, 200) + '...');
      
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Groq response. Raw content:', content);
      throw new Error('Invalid JSON response from AI service: ' + (parseError as Error).message);
    }

    // Validate the response structure
    if (!isValidAnalysisResult(analysisResult)) {
      console.error('Invalid analysis result structure:', analysisResult);
      throw new Error('Invalid analysis result structure from AI service');
    }

    console.log('Groq AI analysis completed successfully');
    return analysisResult;
  } catch (error: any) {
    console.error('Groq AI Analysis Error:', error);
    
    // Check if it's a Groq API error
    if (error?.response?.status === 401) {
      throw new Error('Invalid Groq API key. Please check your configuration.');
    }
    
    if (error?.response?.status === 429) {
      throw new Error('Groq API rate limit exceeded. Please try again later.');
    }
    
    if (error?.response?.status >= 500) {
      throw new Error('Groq API is currently unavailable. Please try again later.');
    }
    
    // Log the actual error for debugging
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Fallback analysis in case of AI service failure
    console.log('Using fallback analysis due to AI service error');
    return getFallbackAnalysis(title, description, category);
  }
}

function isValidAnalysisResult(result: any): result is IdeaAnalysisResult {
  return (
    typeof result === 'object' &&
    typeof result.successScore === 'number' &&
    result.successScore >= 0 &&
    result.successScore <= 100 &&
    typeof result.marketAnalysis === 'string' &&
    typeof result.swot === 'object' &&
    Array.isArray(result.swot.strengths) &&
    Array.isArray(result.swot.weaknesses) &&
    Array.isArray(result.swot.opportunities) &&
    Array.isArray(result.swot.threats) &&
    Array.isArray(result.recommendations)
  );
}

function getFallbackAnalysis(title: string, description: string, category: string): IdeaAnalysisResult {
  console.log('Generating fallback analysis for idea:', { title, category });
  
  return {
    successScore: 65,
    marketAnalysis: `This ${category.toLowerCase()} idea shows potential but requires further market research. The concept addresses a real need, but market validation is essential before proceeding with development.`,
    swot: {
      strengths: [
        'Addresses a clear market need',
        'Leverages current technology trends',
        'Scalable business model potential'
      ],
      weaknesses: [
        'Limited market research available',
        'Potential high development costs',
        'Requires significant user acquisition'
      ],
      opportunities: [
        'Growing market demand',
        'Digital transformation trends',
        'Potential for partnerships'
      ],
      threats: [
        'Competitive market landscape',
        'Economic uncertainties',
        'Technology dependencies'
      ]
    },
    recommendations: [
      'Conduct thorough market research and customer interviews',
      'Develop a minimum viable product (MVP) to test core assumptions',
      'Create a detailed go-to-market strategy',
      'Build a strong team with relevant expertise'
    ],
    financialProjections: {
      revenueProjection: 'Revenue potential depends on market adoption and pricing strategy. Consider freemium or subscription models.',
      costEstimate: 'Initial development costs estimated at $50,000-$150,000 depending on complexity.',
      breakEvenAnalysis: 'Expected break-even within 18-24 months with proper execution and market fit.'
    },
    competitorAnalysis: 'Several competitors exist in this space. Differentiation through unique features, superior user experience, or innovative business model will be crucial.',
    targetAudience: 'Target audience analysis requires more specific market research to identify primary customer segments and their pain points.'
  };
}

// Alternative AI providers (for future implementation)
export async function analyzeWithOpenAI(title: string, description: string, category: string): Promise<IdeaAnalysisResult> {
  // Implementation for OpenAI
  throw new Error('OpenAI integration not yet implemented');
}

export async function analyzeWithGemini(title: string, description: string, category: string): Promise<IdeaAnalysisResult> {
  // Implementation for Google Gemini
  throw new Error('Gemini integration not yet implemented');
}