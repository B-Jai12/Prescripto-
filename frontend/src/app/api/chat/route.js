import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
You are 'Lipi', an empathetic, licensed clinical pharmacist assistant.
Your goal is to provide clear, patient-friendly answers based strictly on the patient's prescription data.

RULES:
1. Refer strictly to the medicines, dosages, and notes in the patient's prescription data.
2. Be warm, calm, and reassuring.
3. If asked anything dangerous or uncertain, advise consulting their prescribing doctor immediately.
4. Keep answers focused, practical, and under 3-4 short paragraphs.
5. Respond strictly in the requested language.
`;

function formatMedicationReply(userMessage, context) {
  const text = (userMessage || '').toLowerCase();
  if (!context) return null;

  const medicines = context.medicines || context.result?.medicines || [];
  if (!medicines || medicines.length === 0) return null;

  const keywords = ["how", "when", "take", "dose", "dosage", "timing", "medicine", "medicines", "tablet", "capsule", "morning", "night", "routine"];
  if (!keywords.some(k => text.includes(k))) return null;

  const lines = ["Here is how to take your prescribed medicine(s):"];
  medicines.forEach((med, i) => {
    lines.push(`\n${i + 1}. ${med.name || 'Medicine'}`);
    if (med.dosage) lines.push(`   • Strength: ${med.dosage}`);
    if (med.frequency) lines.push(`   • Frequency: ${med.frequency}`);
    if (med.timing || med.instructions_en) lines.push(`   • When: ${med.timing || med.instructions_en}`);
    if (med.duration) lines.push(`   • Duration: ${med.duration}`);
    if (med.side_effects && med.side_effects.length) lines.push(`   • Possible side effects: ${med.side_effects.join(', ')}`);
  });
  lines.push("\nSafety Note: Always follow your prescribing doctor's exact advice. Contact your clinic if adverse effects occur.");
  return lines.join('\n');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message = "Hi", context = {}, language = "English" } = body;

    // Direct structured reply if user asks medication schedule
    const directReply = formatMedicationReply(message, context);
    if (directReply) {
      return NextResponse.json({ response: directReply });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const fullPrompt = `PRESCRIPTION CONTEXT:\n${JSON.stringify(context, null, 2)}\n\nUSER QUESTION: ${message}\n\nIMPORTANT: Respond in ${language} language.`;

    // 1. Try Groq
    if (groqKey && !groqKey.startsWith('mock_')) {
      for (const model of ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b']) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: fullPrompt }
              ],
              temperature: 0.3,
              max_tokens: 1024
            })
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return NextResponse.json({ response: reply });
            }
          }
        } catch (groqErr) {
          console.warn(`[Groq ${model} attempt failed]:`, groqErr.message);
        }
      }
    }

    // 2. Fallback to Gemini
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ response: reply });
          }
        }
      } catch (geminiErr) {
        console.warn('[Gemini chat fallback error]:', geminiErr.message);
      }
    }

    return NextResponse.json({
      response: "I have reviewed your prescription details. Please ask any questions you have regarding your dosage, food interactions, or precautions."
    });

  } catch (error) {
    console.error('[API /chat error]:', error);
    return NextResponse.json(
      { response: "I'm having a brief issue accessing the clinical records. Please ask your question again." },
      { status: 500 }
    );
  }
}
