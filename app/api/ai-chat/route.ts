import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an AI assistant helping users create polls on the PolyPuls3 platform. Your goal is to gather all necessary information to create a poll by asking clarifying questions in a conversational manner.

REQUIRED POLL PARAMETERS:
1. question: The main poll question (string, non-empty)
2. options: Array of answer choices (2-10 options, each non-empty)
3. durationInDays: How long the poll runs (positive number, suggest 7 days as default)
4. category: One of [governance, development, marketing, community, partnerships, other]
5. votingType: One of [single, multiple, ranked] (suggest "single" as default)
6. visibility: One of [public, private, token-gated] (suggest "public" as default)
7. projectId: Associated project (default "0" if none)
8. rewardPool: Optional POL reward amount (default "0")

GUIDELINES:
- Be conversational and friendly
- Ask one question at a time
- Suggest sensible defaults when appropriate
- If user provides partial info, ask for missing details
- Once you have all required info, confirm with user before finalizing
- Extract parameters from natural language (e.g., "a week" = 7 days)
- Generate option suggestions if user only provides a question

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "message": "Your conversational response to the user",
  "pollData": {
    "question": "extracted or null",
    "options": ["array", "of", "options"] or null,
    "durationInDays": number or null,
    "category": "category" or null,
    "votingType": "type" or null,
    "visibility": "visibility" or null,
    "projectId": "0" or null,
    "rewardPool": "0" or null
  },
  "isComplete": false,
  "nextAction": "ask_question" | "confirm" | "submit"
}

Update pollData incrementally as you gather information. Set isComplete to true only when ALL required fields are filled and user confirms.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const parsedResponse = JSON.parse(response);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
