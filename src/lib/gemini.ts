import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  aiListingContentSchema, type AIListingContent, type GenerateListingRequest,
  aiLeadScoreSchema, type AILeadScore, type ScoreLeadRequest,
  smartReplyResponseSchema, type SmartReplyRequest, type SmartReplyResponse,
  matchListingsResponseSchema, type MatchListingsRequest, type MatchListingsResponse,
  followUpResponseSchema, type FollowUpRequest, type FollowUpResponse,
  optimizeListingResponseSchema, type OptimizeListingRequest, type OptimizeListingResponse,
} from "./validations";
import { formatPrice } from "./utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildListingPrompt(data: GenerateListingRequest): string {
  const amenitiesList = data.amenities?.length
    ? data.amenities.join(", ")
    : "Not specified";

  const parts = [
    `Property Type: ${data.property_type}`,
    `Transaction: ${data.transaction_type}`,
    `Price: ${formatPrice(data.price)}`,
    `Location: ${[data.locality, data.city, data.state].filter(Boolean).join(", ")}`,
  ];

  if (data.bedrooms != null) parts.push(`Configuration: ${data.bedrooms} BHK${data.bathrooms ? `, ${data.bathrooms} Bath` : ""}`);
  if (data.area_sqft) parts.push(`Area: ${data.area_sqft} sq.ft.`);
  if (data.carpet_area_sqft) parts.push(`Carpet Area: ${data.carpet_area_sqft} sq.ft.`);
  if (data.floor_number != null && data.total_floors) parts.push(`Floor: ${data.floor_number} of ${data.total_floors}`);
  if (data.furnishing) parts.push(`Furnishing: ${data.furnishing}`);
  if (data.facing) parts.push(`Facing: ${data.facing}`);

  parts.push(`Amenities: ${amenitiesList}`);

  return `You are a professional Indian real estate copywriter. Generate a compelling property listing for the following property:

${parts.join("\n")}

Generate a JSON response with exactly these fields:
{
  "title": "SEO-friendly title (max 80 chars)",
  "description": "Professional description (150-200 words)",
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4", "highlight5"],
  "social_post": "Instagram/Facebook post with emojis (max 300 chars)",
  "seo_title": "Meta title for search engines (max 60 chars)",
  "seo_description": "Meta description (max 160 chars)"
}

Guidelines:
- Use professional but approachable tone
- Mention nearby landmarks if area is well-known
- Highlight unique selling points
- Use Indian real estate terminology (carpet area, super built-up, etc.)
- Do NOT make up amenities or features not provided
- Return ONLY valid JSON, no markdown or extra text`;
}

export async function generateListing(data: GenerateListingRequest): Promise<AIListingContent> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = buildListingPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return aiListingContentSchema.parse(parsed);
}

// ─── Lead Scoring ───────────────────────────────────────────────────

function buildLeadScoringPrompt(data: ScoreLeadRequest): string {
  const parts = [
    `Name: ${data.name}`,
    `Source: ${data.source}`,
    `Current Status: ${data.current_status}`,
    `Created: ${data.days_ago} days ago`,
    `Times Contacted: ${data.contact_count}`,
  ];

  if (data.budget_min != null || data.budget_max != null) {
    const min = data.budget_min ? formatPrice(data.budget_min) : "Not specified";
    const max = data.budget_max ? formatPrice(data.budget_max) : "Not specified";
    parts.push(`Budget: ${min} - ${max}`);
  }
  if (data.listing_title) parts.push(`Interested in: ${data.listing_title}${data.listing_price ? ` (${formatPrice(data.listing_price)})` : ""}`);
  if (data.preferred_location) parts.push(`Preferred Location: ${data.preferred_location}`);
  if (data.days_since_response != null) parts.push(`Last Response: ${data.days_since_response} days ago`);

  return `Analyze this real estate lead and provide a score from 0-100:

Lead Info:
${parts.join("\n")}

Scoring factors:
- Budget alignment with interested property (higher = better match)
- Response recency (responded recently = higher score)
- Source quality (referral > website > portal)
- Engagement level (multiple inquiries = higher)
- Timeline urgency (actively looking vs browsing)

Return JSON:
{
  "score": 0-100,
  "reason": "Brief explanation of the score",
  "recommended_action": "What the agent should do next"
}

Return ONLY valid JSON, no markdown or extra text.`;
}

export async function scoreLead(data: ScoreLeadRequest): Promise<AILeadScore> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = buildLeadScoringPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return aiLeadScoreSchema.parse(parsed);
}

// ─── Smart Reply ────────────────────────────────────────────────

function buildSmartReplyPrompt(data: SmartReplyRequest): string {
  const recentChat = data.recent_messages
    .slice(-6)
    .map((m) => `${m.direction === "inbound" ? "Lead" : "Agent"}: ${m.content}`)
    .join("\n");

  const parts = [`Lead Name: ${data.lead_name}`, `Status: ${data.lead_status}`];
  if (data.lead_budget) parts.push(`Budget: ${data.lead_budget}`);
  if (data.lead_preferences) parts.push(`Preferences: ${data.lead_preferences}`);

  return `You are an AI assistant for an Indian real estate agent. Generate 3 short WhatsApp reply suggestions for the agent to send to this lead.

Lead Info:
${parts.join("\n")}

Recent Conversation:
${recentChat || "No messages yet — this is the first outreach."}

Rules:
- Each reply should be 1-3 sentences, conversational, and professional
- Use Indian English (not American)
- If no conversation exists, suggest ice-breaker messages
- Vary tone: one friendly, one informative, one action-oriented
- Do NOT use emojis excessively (max 1 per message)
- Return ONLY valid JSON

Return JSON:
{
  "suggestions": ["reply1", "reply2", "reply3"]
}`;
}

export async function generateSmartReplies(data: SmartReplyRequest): Promise<SmartReplyResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildSmartReplyPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return smartReplyResponseSchema.parse(parsed);
}

// ─── Property Matcher ───────────────────────────────────────────

function buildMatchListingsPrompt(data: MatchListingsRequest): string {
  const prefs = [];
  if (data.lead_budget_min || data.lead_budget_max) {
    prefs.push(`Budget: ${data.lead_budget_min ? `₹${data.lead_budget_min.toLocaleString("en-IN")}` : "Any"} – ${data.lead_budget_max ? `₹${data.lead_budget_max.toLocaleString("en-IN")}` : "Any"}`);
  }
  if (data.lead_location) prefs.push(`Preferred Location: ${data.lead_location}`);
  if (data.lead_property_type) prefs.push(`Property Type: ${data.lead_property_type}`);
  if (data.lead_notes) prefs.push(`Notes: ${data.lead_notes}`);

  const listingSummaries = data.listings
    .map((l) => `- ID: ${l.id} | ${l.title} | ₹${l.price.toLocaleString("en-IN")} | ${l.city} | ${l.property_type} | ${l.bedrooms ?? "N/A"} BHK | ${l.area_sqft ?? "N/A"} sqft | ${l.transaction_type}`)
    .join("\n");

  return `You are a real estate property matching AI. Match the lead's preferences to the available listings.

Lead Preferences:
${prefs.join("\n") || "No specific preferences provided"}

Available Listings:
${listingSummaries}

Rules:
- Return top 3-5 best matches (fewer if not enough good matches)
- match_score: 0-100 based on how well the listing fits
- Only include listings with match_score >= 40
- Consider budget range, location, property type, and size
- Provide a brief reason for each match
- Return ONLY valid JSON

Return JSON:
{
  "matches": [
    { "listing_id": "id", "match_score": 85, "reason": "Brief explanation" }
  ]
}`;
}

export async function matchListings(data: MatchListingsRequest): Promise<MatchListingsResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildMatchListingsPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return matchListingsResponseSchema.parse(parsed);
}

// ─── Follow-Up Suggestions ──────────────────────────────────────

function buildFollowUpPrompt(data: FollowUpRequest): string {
  const parts = [
    `Lead: ${data.lead_name}`,
    `Status: ${data.status}`,
    `Created: ${data.days_since_creation} days ago`,
    `Times Contacted: ${data.contact_count}`,
    `Has WhatsApp: ${data.has_whatsapp ? "Yes" : "No"}`,
  ];

  if (data.last_contacted_days_ago != null) parts.push(`Last Contact: ${data.last_contacted_days_ago} days ago`);
  if (data.budget_range) parts.push(`Budget: ${data.budget_range}`);
  if (data.ai_score) parts.push(`AI Score: ${data.ai_score}/100`);
  if (data.notes) parts.push(`Notes: ${data.notes}`);

  return `You are an AI assistant for an Indian real estate agent. Analyze this lead and suggest the best follow-up strategy.

Lead Info:
${parts.join("\n")}

Rules:
- best_time: Suggest specific timing (e.g., "Tomorrow morning 10-11 AM", "Within 2 hours")
- channel: One of "WhatsApp", "Phone Call", "Email" — pick the most effective
- talking_points: 2-3 specific things the agent should mention/ask
- urgency: "high" (contact ASAP), "medium" (within 1-2 days), "low" (can wait)
- Be practical and actionable
- Return ONLY valid JSON

Return JSON:
{
  "best_time": "string",
  "channel": "string",
  "talking_points": ["point1", "point2", "point3"],
  "urgency": "high|medium|low"
}`;
}

export async function generateFollowUpSuggestions(data: FollowUpRequest): Promise<FollowUpResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildFollowUpPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return followUpResponseSchema.parse(parsed);
}

// ─── Listing Optimizer ──────────────────────────────────────────

function buildOptimizeListingPrompt(data: OptimizeListingRequest): string {
  const parts = [
    `Title: ${data.title}`,
    `Price: ₹${data.price.toLocaleString("en-IN")}`,
    `Type: ${data.property_type}`,
    `City: ${data.city}`,
    `Days Active: ${data.days_active}`,
    `Views: ${data.views_count}`,
    `Inquiries: ${data.inquiries_count}`,
  ];

  if (data.description) parts.push(`Description: ${data.description.slice(0, 300)}`);
  if (data.bedrooms) parts.push(`Bedrooms: ${data.bedrooms}`);
  if (data.area_sqft) parts.push(`Area: ${data.area_sqft} sqft`);
  if (data.amenities?.length) parts.push(`Amenities: ${data.amenities.join(", ")}`);

  return `You are a real estate listing optimization AI for the Indian market. Analyze this listing and suggest improvements to increase views and inquiries.

Listing:
${parts.join("\n")}

Rules:
- score: 1-10 overall listing quality score
- Provide 3-4 specific, actionable suggestions
- Each suggestion: area (e.g., "Title", "Price", "Description", "Photos"), current issue, suggested fix, impact level
- Focus on what drives more inquiries in Indian real estate
- Be specific, not generic (e.g., "Add '2 BHK' to title" not "Improve title")
- Return ONLY valid JSON

Return JSON:
{
  "score": 7,
  "suggestions": [
    { "area": "Title", "current": "Current issue", "suggested": "Specific fix", "impact": "high|medium|low" }
  ]
}`;
}

export async function optimizeListing(data: OptimizeListingRequest): Promise<OptimizeListingResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildOptimizeListingPrompt(data);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);
  return optimizeListingResponseSchema.parse(parsed);
}
