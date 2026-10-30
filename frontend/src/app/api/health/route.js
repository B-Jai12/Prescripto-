import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    engine: 'Prescripto Serverless AI Engine v2.5',
    deployed: true,
    models: ['gemini-2.5-flash', 'groq-gpt-oss-120b']
  });
}

