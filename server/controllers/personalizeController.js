import { PRODUCTS } from '../../src/data/products.js';
import { GoogleGenAI } from '@google/genai';

// Fallback recommendations if API is missing or fails
function getFallbackRecommendations(historyProductIds) {
  // Simple heuristic: count occurrences of styles, colors, and categories in history
  const viewedProducts = PRODUCTS.filter(p => historyProductIds.includes(p.id));
  
  let favoriteStyle = 'Minimalist';
  let favoriteColor = 'Sage Green';
  
  if (viewedProducts.length > 0) {
    const styleCounts = {};
    const colorCounts = {};
    
    viewedProducts.forEach(p => {
      styleCounts[p.style] = (styleCounts[p.style] || 0) + 1;
      colorCounts[p.color] = (colorCounts[p.color] || 0) + 1;
    });
    
    favoriteStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || favoriteStyle;
    favoriteColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || favoriteColor;
  }

  const styleProducts = PRODUCTS.filter(p => p.style === favoriteStyle || p.tags.includes(favoriteColor.toLowerCase()));
  
  const tops = PRODUCTS.filter(p => p.category === 'Tops');
  const bottoms = PRODUCTS.filter(p => p.category === 'Bottoms');
  const outer = PRODUCTS.filter(p => p.category === 'Outerwear');
  const shoes = PRODUCTS.filter(p => p.category === 'Footwear');
  const acc = PRODUCTS.filter(p => p.category === 'Accessories');

  const top = styleProducts.find(p => p.category === 'Tops') || tops[0];
  const bottom = styleProducts.find(p => p.category === 'Bottoms') || bottoms[0];
  const outerwear = styleProducts.find(p => p.category === 'Outerwear') || outer[0];
  const shoe = styleProducts.find(p => p.category === 'Footwear') || shoes[0];
  const accessory = styleProducts.find(p => p.category === 'Accessories') || acc[0];

  return {
    styleProfileName: `${favoriteStyle} Curator Profile`,
    styleProfileDescription: `You show a strong affinity for the refined, functional aspects of ${favoriteStyle} design, leaning towards colors like ${favoriteColor}.`,
    colorAnalysis: `The color pairing of ${favoriteColor} with balanced tones creates a clean, sophisticated, high-contrast look suitable for daily activities.`,
    trendingInsight: `Utility aesthetics and organic textile finishes are dominating global street culture. Your current pattern fits squarely into this macro-trend.`,
    outfits: [
      {
        id: 'outfit-fallback-1',
        name: `The ${favoriteStyle} Signature Look`,
        description: `A perfectly balanced outfit featuring high-quality foundational layers and matching earthy accents.`,
        colorComboExplanation: `Harmonizes the natural hue of ${top.color} with the deep structured tone of ${bottom.color}.`,
        suitabilityScore: 92,
        items: [
          { productId: top.id, role: 'Hero Piece', reason: 'A premium staple item matching your favorite category preferences.' },
          { productId: bottom.id, role: 'Complement', reason: 'Tapered structured cut that frames the upper layer perfectly.' },
          { productId: shoe.id, role: 'Footwear Match', reason: 'High-comfort trainers that anchor the look with clean, athletic lines.' }
        ]
      },
      {
        id: 'outfit-fallback-2',
        name: `Layered Winter Smart-Casual`,
        description: `An elegant multilayer ensemble for cool breezes or evening gatherings, prioritizing textured insulation.`,
        colorComboExplanation: `Contrasts the warmth of ${outerwear.color} with the neutrality of ${accessory.color}.`,
        suitabilityScore: 85,
        items: [
          { productId: outerwear.id, role: 'Hero Piece', reason: 'Premium tailored insulation layer designed to be worn open.' },
          { productId: top.id, role: 'Complement', reason: 'A solid inner layer offering breathability and core comfort.' },
          { productId: bottom.id, role: 'Complement', reason: 'Matches the relaxed structural silhouette of the outerwear.' },
          { productId: accessory.id, role: 'Accent Accessory', reason: 'Locks in heat while completing the visual tone.' }
        ]
      }
    ]
  };
}

// Helper function to call the active AI provider (Gemini or Groq)
async function generateAICompletion({ systemInstruction, prompt, isChat = false, chatHistory = [] }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const hasGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
  const hasGroq = groqKey && groqKey !== 'your_groq_api_key_here';

  if (hasGemini) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const contents = isChat
      ? (chatHistory || []).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini API');
    return JSON.parse(text.trim());
  }

  if (hasGroq) {
    const messages = isChat
      ? [
          { role: 'system', content: systemInstruction },
          ...(chatHistory || []).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        ]
      : [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        response_format: { type: 'json_object' },
        temperature: isChat ? 0.5 : 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq API');
    return JSON.parse(text.trim());
  }

  throw new Error('No AI provider key configured.');
}

// 1. Personalize Capsules Endpoint
export async function personalizeCapsules(req, res) {
  try {
    const { browsingHistory } = req.body;
    
    if (!Array.isArray(browsingHistory) || browsingHistory.length === 0) {
      const generalRecommendations = getFallbackRecommendations([]);
      return res.json(generalRecommendations);
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
    const hasGroq = groqKey && groqKey !== 'your_groq_api_key_here';

    if (!hasGemini && !hasGroq) {
      console.warn('Neither GEMINI_API_KEY nor GROQ_API_KEY is configured. AI Personalization will use high-fidelity fallback algorithm.');
      const fallback = getFallbackRecommendations(browsingHistory.map(h => h.productId));
      return res.json(fallback);
    }

    const historySummary = browsingHistory.map(event => {
      const p = PRODUCTS.find(prod => prod.id === event.productId);
      if (!p) return null;
      return `- Action: ${event.action} | Item: "${p.name}" | Category: ${p.category} | Color: ${p.color} | Style: ${p.style} | Price: $${p.price} | Tags: ${p.tags.join(', ')}`;
    }).filter(Boolean).join('\n');

    const availableProductsSummary = PRODUCTS.map(p => 
      `ID: ${p.id} | "${p.name}" | Category: ${p.category} | Price: $${p.price} | Color: ${p.color} | Style: ${p.style} | Tags: ${p.tags.join(', ')}`
    ).join('\n');

    const systemInstruction = `You are an elite haute-couture fashion stylist, color theory expert, and visual e-commerce catalog personalizer.
Your goal is to analyze the user's browsing history events and design customized outfits, color palettes, and stylistic profiles using ONLY the products available in our inventory catalog.

Available Inventory Catalog:
${availableProductsSummary}

User's Browsing Pattern & Shopping Cart History:
${historySummary}

Your response must be standard, valid JSON. 
You must output a JSON object with the following exact keys:
1. "styleProfileName": (string) A creative name summarizing the user's style archetype.
2. "styleProfileDescription": (string) Deep personalized stylist analysis of their browsing habits.
3. "colorAnalysis": (string) Color combination insights, pairing viewed colors with matching accessories.
4. "trendingInsight": (string) Current global macro-trends that this user's profile corresponds to (e.g., "Quiet Luxury", "Techwear Gorpcore", "Retro Athletics").
5. "outfits": (array) Exactly 3 styled outfits compiled from the available catalog items. Each outfit must be an object with the following keys:
   - "id": (string) A unique ID for this outfit (e.g., "outfit-1", "outfit-2", "outfit-3").
   - "name": (string) A catchy outfit concept name.
   - "description": (string) Detailed description of the look and fit.
   - "colorComboExplanation": (string) Explanation of why these color matches look incredible together.
   - "suitabilityScore": (number) Suitability match score from 50 to 100.
   - "items": (array) An array of objects, each representing an item in the outfit. Each item must have the following keys:
     - "productId": (string) The exact ID of the product from the catalog (e.g., "prod-1", "prod-2"). It MUST exist in the available catalog.
     - "role": (string) One of: 'Hero Piece', 'Complement', 'Accent Accessory', 'Footwear Match'.
     - "reason": (string) Custom reason why this item is styled in this outfit for this specific user.

Ensure the products used in the outfits exist in the available inventory catalog. Do not invent products.`;

    const prompt = "Please analyze my style patterns and generate my personalized fashion recommendations.";

    const data = await generateAICompletion({
      systemInstruction,
      prompt,
      isChat: false
    });

    res.json(data);
  } catch (error) {
    console.error('Error generating AI personalization:', error);
    const browsingHistory = req.body.browsingHistory || [];
    const fallback = getFallbackRecommendations(browsingHistory.map(h => h.productId));
    res.json(fallback);
  }
}

// 2. Chat Stylist Endpoint
export async function chatStylist(req, res) {
  try {
    const { chatHistory, browsingHistory } = req.body;

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
    const hasGroq = groqKey && groqKey !== 'your_groq_api_key_here';

    if (!hasGemini && !hasGroq) {
      return res.json({
        message: "I'd love to help you style your outfit, but neither the **Gemini API key** nor the **Groq API key** is configured in `.env.local`. Please configure one of them to enable live AI styling!",
        recommendedProductIds: []
      });
    }

    // Compile history summary
    const historySummary = (browsingHistory || []).map(event => {
      const p = PRODUCTS.find(prod => prod.id === event.productId);
      if (!p) return null;
      return `- Action: ${event.action} | Item: "${p.name}" | Category: ${p.category} | Color: ${p.color} | Style: ${p.style} | Price: $${p.price} | Tags: ${p.tags.join(', ')}`;
    }).filter(Boolean).join('\n');

    // Compile available items summary
    const availableProductsSummary = PRODUCTS.map(p => 
      `ID: ${p.id} | Name: "${p.name}" | Category: ${p.category} | Price: $${p.price} | Color: ${p.color} | Style: ${p.style} | Tags: ${p.tags.join(', ')}`
    ).join('\n');

    const systemInstruction = `You are "Atelier Concierge", an elite haute-couture fashion stylist, color theory expert, and visual shopping consultant.
Your role is to chat with the user, answer their styling queries, and recommend real items from our store catalog.

Available Boutique Catalog:
${availableProductsSummary}

User's Browsing History:
${historySummary}

Your response must be standard, valid JSON.
You must output a JSON object with the following exact keys:
1. "message": (string) Your conversational response to the user. Write in an elegant, professional, helpful stylist tone. Keep it relatively concise (under 120 words). You can use Markdown formatting like bolding, bullet points, or headers to layout your styling advice beautifully.
2. "recommendedProductIds": (array of strings) The exact product IDs from our catalog that you recommended or referenced in your response. These MUST exist in the catalog. If you did not recommend any specific items, return an empty array []. Do not invent IDs.

Styling Guidelines:
- If the user asks for a specific look (e.g. "beach outfit"), pick 2-4 items that go together (e.g. top, bottom, shoes) and explain why they work in terms of colors and fabrics.
- Reference the user's browsing history to understand if they prefer 'Minimalist', 'Athleisure', or 'Streetwear', and tailor your chat advice accordingly.
- Be polite, luxury-oriented, and encouraging.`;

    const data = await generateAICompletion({
      systemInstruction,
      chatHistory,
      isChat: true
    });

    res.json(data);
  } catch (error) {
    console.error('Error in chat-stylist controller:', error);
    res.status(500).json({
      message: "Forgive me, but I encountered an error formulating my response. Let me try again shortly.",
      recommendedProductIds: []
    });
  }
}
