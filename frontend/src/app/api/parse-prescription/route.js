import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Up to 60 seconds on Vercel Pro/Hobby

const GEMINI_SYSTEM_PROMPT = `
You are an expert clinical pharmacist and prescription digitization assistant.
Your task is to accurately extract all information from the provided doctor's prescription image.

RULES:
1. Decode frequency notations: '1-0-1' = morning and night, '1-1-1' = three times daily, '1-0-0' = morning, '0-0-1' = night, 'a.c.' = before food, 'p.c.' = after food.
2. Read handwritten drug names carefully based on Indian pharmaceutical formulations (e.g. Augmentin 625, Pan-D 40, Dolo 650, Telma-H, Azithral 500, etc.).
3. Provide patient-friendly instructions for every medicine in three languages:
   - instructions_en: Clear English instructions
   - instructions_hi: Clear Hindi instructions (e.g. 'सुबह और रात के खाने के बाद 1 गोली लें')
   - instructions_te: Clear Telugu instructions (e.g. 'రోజూ ఉదయం మరియు రాత్రి భోజనం తర్వాత ఒక టాబ్లెట్ వేసుకోండి')
4. CLINICAL ANALYSIS: Use your clinical knowledge to provide:
   - drug_interactions: Check if prescribed medicines interact or have warnings
   - diet_and_lifestyle: Return 4+ specific actionable tips (diet to follow/avoid, exercise, hydration) tailored to the illness deduced from the medicines
   - side_effects: List common side effects for each medicine
5. Return strictly valid JSON adhering to the requested schema.
`;

const PRESCRIPTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    patient_details: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        age: { type: "STRING" },
        gender: { type: "STRING" }
      }
    },
    hospital_details: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        address: { type: "STRING" },
        doctor_name: { type: "STRING" }
      }
    },
    medicines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dosage: { type: "STRING" },
          frequency: { type: "STRING" },
          duration: { type: "STRING" },
          timing: { type: "STRING" },
          instructions_en: { type: "STRING" },
          instructions_hi: { type: "STRING" },
          instructions_te: { type: "STRING" },
          side_effects: { type: "ARRAY", items: { type: "STRING" } },
          estimated_mrp: { type: "NUMBER" },
          common_salt: { type: "STRING" }
        },
        required: ["name", "instructions_en"]
      }
    },
    drug_interactions: { type: "STRING" },
    diet_and_lifestyle: { type: "ARRAY", items: { type: "STRING" } },
    doctor_notes: { type: "STRING" },
    follow_up: { type: "STRING" },
    confidence_score: { type: "NUMBER" },
    analysis_notes: { type: "STRING" }
  },
  required: ["medicines", "diet_and_lifestyle", "confidence_score"]
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ detail: 'No prescription file provided.' }, { status: 400 });
    }

    const languages = request.nextUrl.searchParams.get('languages') || 'en,te,hi';
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ detail: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/png';

    // High-availability model chain with automatic transient 503/429 retry
    const models = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let lastError = null;
    let extractedData = null;

    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [
          { text: `Read this doctor prescription and extract all data. Ensure patient instructions in English, Hindi, and Telugu for languages requested: ${languages}.` },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json",
        response_schema: PRESCRIPTION_SCHEMA
      }
    });

    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 20000);

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: requestBody
          });

          clearTimeout(timer);

          if (response.ok) {
            const geminiRes = await response.json();
            const candidate = geminiRes.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              extractedData = JSON.parse(candidate);
              break;
            }
          }

          if (response.status === 503 || response.status === 429) {
            console.warn(`[Vercel Serverless] ${model} returned ${response.status} (attempt ${attempt}/2). Waiting 1.2s...`);
            if (attempt === 1) {
              await new Promise((r) => setTimeout(r, 1200));
              continue;
            }
          }

          const errText = await response.text();
          lastError = new Error(`Model ${model} error (${response.status})`);
          break; // move to next model in chain
        } catch (err) {
          lastError = err;
          console.warn(`[Vercel Serverless] ${model} attempt ${attempt} error:`, err.message);
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break;
        }
      }
      if (extractedData) break;
    }

    if (!extractedData) {
      return NextResponse.json(
        { detail: 'AI analysis service is temporarily busy. Please wait a moment and try uploading again.' },
        { status: 503 }
      );
    }

    // Ensure fallback wellness advice if empty
    if (!extractedData.diet_and_lifestyle || extractedData.diet_and_lifestyle.length === 0) {
      extractedData.diet_and_lifestyle = [
        "Take all medications with clean drinking water at the exact prescribed times.",
        "Drink at least 2.5 liters of water daily to maintain hydration and flush medicine metabolites.",
        "Avoid alcohol, smoking, and excessively oily or spicy foods during treatment.",
        "Engage in 10-15 minutes of gentle walking after meals if feeling comfortable."
      ];
    }

    return NextResponse.json({
      raw_text: "",
      result: extractedData,
      engine: "Prescripto-Flash-2.5-Serverless",
      privacy: "Encrypted-In-Transit",
      languages
    });

  } catch (error) {
    console.error('[API /parse-prescription error]:', error);
    return NextResponse.json(
      { detail: error.message || 'Prescription analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
