// File: api/generate.js
export default async function handler(req, res) {
  try {
    const { topic, style, count, apiProvider, apiKey } = await req.json();

    if (!topic || !style || !count) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    let promptSystem = "";
    if (style === "vector") {
      promptSystem = `
        Kamu adalah ahli pembuat prompt vektor 2D. Buatkan ${count} prompt unik 
        berdasarkan ide "${topic}" dengan gaya Flat 2D vector.
        Contoh gaya: "Flat 2D vector of people teamwork in office, clean outlines, white background, no text".
        Pastikan setiap prompt unik dan profesional.
      `;
    } else if (style === "video") {
      promptSystem = `
        Kamu adalah ahli pembuat prompt video sinematik. Buatkan ${count} prompt unik 
        berdasarkan ide "${topic}" dengan gaya cinematic 4K video.
        Gunakan bahasa Inggris dan detail teknis (lighting, camera, mood).
      `;
    } else {
      promptSystem = `
        Kamu adalah ahli pembuat prompt gambar realistis. Buatkan ${count} prompt unik
        berdasarkan ide "${topic}" untuk hasil gambar photorealistic dan komersial.
      `;
    }

    // --- Pilihan model ---
    let apiURL = "";
    let headers = {};
    let body = {};

    if (apiProvider === "openai") {
      apiURL = "https://api.openai.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      };
      body = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Kamu pembuat prompt profesional untuk AI generator." },
          { role: "user", content: promptSystem },
        ],
      };
    } else {
      apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      headers = { "Content-Type": "application/json" };
      body = {
        contents: [{ parts: [{ text: promptSystem }] }],
      };
    }

    const response = await fetch(apiURL, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await response.json();

    let output = "";
    if (data?.choices?.[0]?.message?.content) {
      output = data.choices[0].message.content;
    } else if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      output = data.candidates[0].content.parts[0].text;
    } else {
      output = JSON.stringify(data, null, 2);
    }

    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
}
