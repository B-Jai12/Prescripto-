export const mockPrescriptionResult = {
  raw_text: `Dr. Ramesh Kumar MBBS, MD
Sunshine Multi-Specialty Hospital
Plot 42, Banjara Hills, Hyderabad - 500034
Ph: 040-23456789

Patient: Arjun Reddy     Age: 34 yrs    Gender: Male
Date: 10/05/2026

Rx:
1. Tab. Augmentin 625mg  1-0-1  x 7 days  p.c.
2. Cap. Pan-D 40mg       1-0-0  x 7 days  a.c.
3. Tab. Dolo 650mg       1-1-1  x 5 days  p.c. (SOS)
4. Syr. Benadryl 10ml    0-0-1  x 5 days  h.s.

Advice: Drink plenty of fluids. Rest well.
Follow up after 7 days.`,

  result: {
    patient_details: {
      name: "Arjun Reddy",
      age: "34 years",
      gender: "Male",
    },
    hospital_details: {
      name: "Sunshine Multi-Specialty Hospital",
      address: "Plot 42, Banjara Hills, Hyderabad - 500034",
      doctor_name: "Dr. Ramesh Kumar",
    },
    medicines: [
      {
        name: "Augmentin 625mg",
        dosage: "625mg",
        frequency: "Twice daily (Morning & Night)",
        duration: "7 days",
        timing: "After meals",
        instructions_en:
          "Take one tablet of Augmentin 625mg in the morning and one at night after eating food. Complete the full 7-day course even if you feel better.",
        instructions_te:
          "ఉదయం మరియు రాత్రి భోజనం తర్వాత ఒక్కో Augmentin 625mg మాత్ర తీసుకోండి. మీకు బాగుగా అనిపించినా 7 రోజుల కోర్సు పూర్తి చేయండి.",
        instructions_hi:
          "सुबह और रात के खाने के बाद एक-एक Augmentin 625mg की गोली लें। 7 दिनों का पूरा कोर्स पूरा करें, भले ही आप बेहतर महसूस करें।",
        side_effects: [
          "Nausea or upset stomach (take with food to reduce this)",
          "Diarrhea — stay hydrated and inform your doctor if severe",
        ],
      },
      {
        name: "Pan-D 40mg",
        dosage: "40mg",
        frequency: "Once daily (Morning)",
        duration: "7 days",
        timing: "Before meals",
        instructions_en:
          "Take one Pan-D 40mg capsule every morning on an empty stomach, 30 minutes before breakfast.",
        instructions_te:
          "ప్రతి ఉదయం అల్పాహారానికి 30 నిమిషాల ముందు ఖాళీ కడుపుతో ఒక Pan-D 40mg కాప్సూల్ తీసుకోండి.",
        instructions_hi:
          "हर सुबह नाश्ते से 30 मिनट पहले खाली पेट एक Pan-D 40mg कैप्सूल लें।",
        side_effects: [
          "Mild headache or dizziness (usually resolves on its own)",
          "Dry mouth — sip water frequently",
        ],
      },
      {
        name: "Dolo 650mg",
        dosage: "650mg",
        frequency: "Three times daily (SOS - only if fever/pain)",
        duration: "5 days",
        timing: "After meals",
        instructions_en:
          "Take one Dolo 650mg tablet three times a day after meals, but ONLY when you have fever or body pain. Do not take it if you feel fine.",
        instructions_te:
          "జ్వరం లేదా శరీర నొప్పి ఉన్నప్పుడు మాత్రమే భోజనం తర్వాత రోజుకు మూడు సార్లు ఒక Dolo 650mg మాత్ర తీసుకోండి.",
        instructions_hi:
          "केवल बुखार या शरीर दर्द होने पर ही खाने के बाद दिन में तीन बार एक Dolo 650mg की गोली लें।",
        side_effects: [
          "Rarely causes liver strain if taken in excess — strictly follow the dose",
          "Mild skin rash — stop and consult your doctor if rash appears",
        ],
      },
      {
        name: "Benadryl Syrup",
        dosage: "10ml",
        frequency: "Once daily (Night)",
        duration: "5 days",
        timing: "At bedtime",
        instructions_en:
          "Take 10ml (2 teaspoons) of Benadryl syrup at night before sleeping. It may cause drowsiness, so do not drive after taking it.",
        instructions_te:
          "నిద్రపోయే ముందు రాత్రి 10ml (2 టీస్పూన్లు) Benadryl సిరప్ తీసుకోండి. ఇది నిద్రను కలిగిస్తుంది.",
        instructions_hi:
          "रात को सोने से पहले 10ml (2 चम्मच) Benadryl सिरप लें। इससे नींद आ सकती है, इसलिए इसे लेने के बाद गाड़ी न चलाएं।",
        side_effects: [
          "Drowsiness — do not drive or operate machinery after taking this",
          "Dry throat or nose — stay hydrated",
        ],
      },
    ],
    drug_interactions:
      "Benadryl (diphenhydramine) combined with Augmentin may increase drowsiness in some patients. Avoid alcohol completely during this course as it amplifies sedation from Benadryl and stresses the liver.",
    diet_and_lifestyle: [
      "🥗 EAT: Consume soft, easy-to-digest foods like khichdi, curd rice, bananas, and boiled vegetables. Your gut needs protection while on Augmentin.",
      "🚫 AVOID: Completely avoid alcohol, spicy food, raw salads, and street food for the entire 7-day course. These can worsen stomach irritation caused by the antibiotic.",
      "💧 HYDRATE: Drink at least 2.5–3 litres of water daily. This helps flush out bacteria and reduces antibiotic side effects.",
      "🧘 REST: Take complete rest for the first 2–3 days. Avoid strenuous physical activity. Light walks of 10–15 minutes are encouraged after day 3.",
      "🌿 PROBIOTICS: Eat one bowl of fresh curd (yogurt) daily to replenish gut bacteria depleted by the antibiotic course.",
      "🛌 SLEEP: Ensure 8 hours of sleep. The Benadryl syrup will help with this. A good sleep cycle is critical for immune recovery.",
    ],
    doctor_notes: "Drink plenty of fluids. Take complete rest.",
    follow_up: "Follow up after 7 days.",
  },
};
