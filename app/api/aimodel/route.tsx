import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCreditAccount, readTripCredits, commitTripPlan } from "@/lib/trip-credits";


// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json", // Ensures strict JSON response
  },
});

const PROMPT = `
You are an AI Trip Planner Agent.

Your goal is to help the user plan a trip by asking EXACTLY ONE relevant trip-related question at a time, in a friendly and interactive way.

========================
INITIAL ANALYSIS (Intent)
========================
Check the user's FIRST message (or the latest action) to identify intent:

If user intent is:
- "Create New Trip" -> STANDARD FLOW (follow steps in order)
- "Inspire me where to go" -> SUGGESTION FLOW (general ideas)
- "Discover Hidden gems" -> SUGGESTION FLOW (focus on offbeat places)
- "Adventure Destination" -> SUGGESTION FLOW (focus on adventure places)

If intent is unclear, ask ONE short question to confirm what they want.

========================
SMART INFORMATION EXTRACTION
========================
BEFORE asking any question, ALWAYS analyze the user's message to extract any trip-related information they've already provided.

Examples:
- "Create a trip from Mumbai to Goa" → source: Mumbai, destination: Goa
- "Plan a 5-day trip to Paris" → destination: Paris, duration: 5 days
- "I want to visit Tokyo with my family for a week" → destination: Tokyo, group_size: Family, duration: 7 days
- "Weekend trip to Dubai under 50k" → destination: Dubai, duration: 2-3 days, budget hint

IMPORTANT RULES:
1. Extract ALL information from the user's message first
2. SKIP questions for information already provided
3. ONLY ask for missing information
4. Move to the NEXT unanswered question in the flow
5. DO NOT ask redundant questions

========================
STANDARD FLOW (User knows destination)
========================
Ask questions ONLY in this exact order and wait for the user's answer before moving to the next:

1) Starting location (source city/country)
2) Destination (city/country)
3) Group size (Solo / Couple / Family / Friends)
4) Budget (Low / Medium / High)
5) Trip duration (number of days)
6) Travel interests (Adventure / Sightseeing / Cultural / Food / Nightlife / Relaxation)
7) Travel Vibe (Relaxed / Balanced / Fast-paced / Culture-focused / Food-focused / Leisure)
8) Travel Pace (Relaxed / Moderate / Packed)
9) Special requirements or preferences (if any)

========================
SUGGESTION FLOW (User needs ideas)
========================
1) Ask for Starting location (source city/country)
2) Ask for Preferences immediately (SKIP destination for now).
   Example questions:
   - "What kind of trip are you looking for (relaxing, adventure, cultural, food, nightlife)?"
   - "Any region or vibe you prefer (mountains, beaches, city, nature, cold, warm)?"
3) Suggest 2-3 destinations based on:
   - starting location
   - user intent (Inspiration / Hidden gems / Adventure)
   - preferences
4) Wait for the user to pick ONE destination.
5) Once destination is selected, resume STANDARD FLOW from Step 3 (Group size).

========================
Rules (Very Important)
========================
- Ask ONLY ONE question per message.
- NEVER ask multiple questions in one response.
- NEVER ask irrelevant questions.
- ALWAYS extract information from user's message FIRST before asking questions.
- SKIP questions for information already provided by the user.
- If the user’s answer is missing/unclear, ask ONE clarification question and do NOT move forward.
- Keep the tone conversational, helpful, and interactive.
- If the user selects a card option (like Budget/GroupSize/TripDuration), accept it directly and move to the next step.
- Do NOT repeat already confirmed answers unless user asks to edit.

========================
UI Component Selection
========================
Along with every response, you MUST decide which UI component should be shown next.

Allowed UI values:
- "source"
- "destination"
- "groupSize"
- "budget"
- "tripDuration"
- "interests"
- "tripStyle"
- "travelPace"
- "preferences"
- "suggestion"
- "final"

UI rules:
- Use "source" when asking starting location
- Use "destination" when asking destination city/country
- Use "groupSize" when asking group size
- Use "budget" when asking budget
- Use "tripDuration" when asking duration
- Use "interests" when asking interests
- Use "tripStyle" when asking travel vibe
- Use "travelPace" when asking travel pace
- Use "preferences" when asking special requirements/preferences
- Use "suggestion" when suggesting 2-3 destinations for user to choose from
- Use "final" only when ALL required info is collected and you're generating the final trip plan

========================
Final Step (Ready to Plan)
========================
When ALL required information is collected (steps 1-8 completed):
- Set "ui": "final"
- In "resp", output ONLY a short, friendly 1-2 sentence confirmation (e.g., "Great, I've got all your details! Review your trip summary below and click 'Generate Plan' to create your full custom itinerary and hotel recommendations.").
- CRITICAL: DO NOT write any day-by-day itinerary, places, markdown tables, or long paragraphs in "resp". The UI will display the summary card and generate the complete structured plan when the user clicks Generate Plan.

========================
IMPORTANT OUTPUT FORMAT
========================
You MUST ALWAYS respond ONLY in strict JSON format.
No extra text. No markdown outside of the JSON string values. No explanations.

JSON schema:
{
  "resp": "string",
  "ui": "source|destination|groupSize|budget|tripDuration|interests|tripStyle|travelPace|preferences|suggestion|final"
}
`;


const FINAL_PROMPT = `
Generate Travel Plan with give details, give me Hotels options list (Minimum 8-10 hotels) with HotelName,
Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url,
Geo Coordinates, Place address, ticket Pricing, Time travel each of the location , with each day plan with best time to visit in JSON format.

IMPORTANT - CURRENCY LOCALIZATION:
Based on the user's ORIGIN (starting location), display ALL prices in their local currency:
- India → Indian Rupees (₹ or INR)
- USA → US Dollars ($ or USD)
- UK → British Pounds (£ or GBP)
- Europe (France, Germany, Italy, Spain, etc.) → Euros (€ or EUR)
- Japan → Japanese Yen (¥ or JPY)
- Australia → Australian Dollars (A$ or AUD)
- Canada → Canadian Dollars (C$ or CAD)
- UAE → UAE Dirham (AED)
- Singapore → Singapore Dollars (S$ or SGD)
- Other countries → Use their local currency

Examples:
- If origin is "Mumbai" or "Delhi" → Show prices as "₹5,000" or "INR 5,000"
- If origin is "New York" or "Los Angeles" → Show prices as "$100" or "USD 100"
- If origin is "London" → Show prices as "£80" or "GBP 80"
- If origin is "Paris" or "Berlin" → Show prices as "€90" or "EUR 90"

Apply this currency format to:
1. Hotel prices (price_per_night)
2. Ticket pricing for attractions
3. Any budget estimates or cost breakdowns

IMPORTANT - BUDGET INTERPRETATION:
The user will select one of these budget options:
- "Low" (Cheap) → Stay conscious of costs, budget-friendly options, hostels, affordable hotels, street food
- "Medium" (Moderate) → Keep cost on the average side, mid-range hotels, mix of budget and premium experiences
- "High" (Luxury) → Don't worry about cost, 5-star hotels, premium experiences, fine dining

Adjust ALL recommendations (hotels, restaurants, activities) based on the selected budget level.

IMPORTANT - TRIP STYLE INTERPRETATION:
The user will select one of these trip styles:
- "relaxed" (Relaxed) → Take it easy, slower pace, more rest time, fewer activities
- "balanced" (Balanced) → Sightseeing + Rest, mix of activities and relaxation
- "fast" (Fast-paced) → See everything possible, packed schedule, maximize experiences
- "culture" (Culture-focused) → History & Art, museums, historical sites, cultural experiences
- "food" (Food-focused) → Culinary journey, food tours, local restaurants, cooking classes
- "leisure" (Leisure) → Beaches & Spas, relaxation, wellness, beach time

Tailor the itinerary activities and recommendations to match the selected trip style.

IMPORTANT - INTERESTS INTERPRETATION:
The user can select one or multiple interests from these options:
- "adventure" (Adventure 🏔️) → Hiking, trekking, adventure sports, outdoor activities
- "sightseeing" (Sightseeing 🏛️) → Famous landmarks, monuments, viewpoints, tourist attractions
- "culture" (Culture 🎭) → Museums, art galleries, cultural shows, traditional experiences
- "food" (Food 🍜) → Local cuisine, food markets, restaurants, street food, culinary experiences
- "nightlife" (Nightlife 🌃) → Bars, clubs, evening entertainment, night markets
- "relaxation" (Relaxation 🧘) → Spas, wellness centers, peaceful spots, meditation
- "shopping" (Shopping 🛍️) → Markets, malls, local shops, souvenirs
- "beaches" (Beaches 🏖️) → Beach activities, water sports, coastal areas
- "nature" (Nature 🌿) → Parks, gardens, wildlife, natural scenery
- "mountains" (Mountains ⛰️) → Mountain views, hill stations, scenic drives

Include activities and places that match the selected interests. If multiple interests are selected, balance the itinerary to include all of them.

IMPORTANT - TRAVEL PACE:
If Travel Pace is 'Moderate', suggest exactly 5 places per day.
If Travel Pace is 'Packed', suggest minimum 6-8 places per day.
If Travel Pace is 'Relaxed', suggest 2-3 places per day.

Output Schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string (in user's local currency based on origin)",
        "hotel_image_url": "string",
        "geo_coordinates": {
          "lat": "number",
          "lng": "number"
        },
        "rating": "number",
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": "number",
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": {
              "lat": "number",
              "lng": "number"
            },
            "place_address": "string",
            "ticket_pricing": "string (in user's local currency based on origin)",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}
`;

function extractAndParseJson(text: string): Record<string, unknown> | null {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();
  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Extract from markdown code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Extract outermost { ... }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const rawJson = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(rawJson);
    } catch {
      // 4. Try stripping trailing commas before closing braces/brackets
      try {
        const cleaned = rawJson.replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  return null;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    const account = await getCreditAccount();
    if (!account) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { messages, isFinal = false, requestId = crypto.randomUUID() } = body ?? {};
    if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{8,100}$/.test(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }
    if (typeof isFinal !== "boolean" || !Array.isArray(messages) || !messages.length || messages.length > 100 ||
        messages.some((m: ChatMessage) => !m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 20000) ||
        messages.at(-1).role !== "user" || !messages.at(-1).content.trim()) {
      return NextResponse.json({ error: "Provide a valid conversation ending with a user message." }, { status: 400 });
    }
    const lastMessage: ChatMessage = messages[messages.length - 1];
    const before = await readTripCredits(account, requestId);
    if (before.tripPlan) return NextResponse.json({ trip_plan: before.tripPlan, credits: before.info });
    const limitResponse = () => NextResponse.json({
      error: "No trip credits remaining. Please check your plan.",
      resp: "No trip credits remaining. Please check your plan.",
      ui: "limit",
    }, { status: 429 });
    if (isFinal && before.info.remaining < 1) return limitResponse();

    // Separate the history (all messages except the last one, which we already have)
    const historyMessages = messages.slice(0, -1);

    // 2. Select Prompt
    const activePrompt = isFinal ? FINAL_PROMPT : PROMPT;

    // 3. Start the Chat Session with System Instructions
    // Sanitize history to remove messages with empty/null content which cause Gemini 400 errors
    const sanitizedHistory = historyMessages
      .filter((msg: ChatMessage) => msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0)
      .map((msg: ChatMessage) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: sanitizedHistory,
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: activePrompt }]
      },
    });

    const userMessage = lastMessage.content || "Generate trip plan"; // Fallback safety

    // 4. Send the message with retry logic and robust JSON extraction
    let parsedJson: Record<string, unknown> | null = null;
    let lastError: unknown;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to send message to Gemini API...`);
        const result = await chat.sendMessage(userMessage);
        console.log(`✅ Successfully received response from Gemini API`);
        const responseText = result.response.text();

        parsedJson = extractAndParseJson(responseText);

        if (!parsedJson) {
          console.warn(`Attempt ${attempt}: Response was not valid JSON. Response length: ${responseText ? responseText.length : 0}`);
          // For non-final conversational queries, fallback to returning the message text so user experience isn't broken
          if (!isFinal && responseText && responseText.trim().length > 0) {
            const cleanText = responseText.replace(/```(?:json)?|```/g, "").trim();
            if (cleanText) {
              parsedJson = {
                resp: cleanText,
                ui: "source",
              };
              break;
            }
          }
          throw new Error("No valid JSON found in response");
        }

        break; // Successfully got and parsed JSON
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    if (!parsedJson) {
      throw lastError instanceof Error ? lastError : new Error("No valid JSON found in response");
    }

    // Save the successful result and debit in one atomic transaction.
    let credits = before.info;
    if (parsedJson.trip_plan) {
      const plan = parsedJson.trip_plan as { hotels?: unknown[]; itinerary?: Array<{ activities?: unknown[] }> };
      if (!Array.isArray(plan.hotels) || !Array.isArray(plan.itinerary) ||
          !plan.itinerary.length || plan.itinerary.some((day: { activities?: unknown }) => !day || !Array.isArray(day.activities))) {
        throw new Error("The trip service returned an incomplete plan. Please try again.");
      }
      const charged = await commitTripPlan(account, requestId, parsedJson.trip_plan);
      if (charged.denied) return limitResponse();
      credits = charged.info;
      parsedJson.trip_plan = charged.tripPlan;
    } else if (isFinal) {
      throw new Error("The trip service did not return a plan. Please try again.");
    }
    return NextResponse.json({ ...parsedJson, credits });
  } catch (e) {
    console.error("Error in AI Model API:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";

    // Provide more helpful error messages
    let userMessage = errorMessage.includes("Credit service") ? errorMessage : "Trip generation is temporarily unavailable. Please try again.";
    if (errorMessage.includes("fetch failed") || errorMessage.includes("Failed to connect")) {
      userMessage = "Network connection issue. Please check your internet connection and try again.";
    } else if (errorMessage.includes("API key")) {
      userMessage = "API key validation failed. Please check your Gemini API key configuration.";
    }

    return NextResponse.json({
      error: userMessage,
    }, { status: errorMessage.includes("Credit service") ? 503 : 502 });
  }
}
