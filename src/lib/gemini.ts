import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  aiListingContentSchema, type AIListingContent, type GenerateListingRequest,
  aiLeadScoreSchema, type AILeadScore, type ScoreLeadRequest,
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
    model: "gemini-2.5-flash",
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
    model: "gemini-2.5-flash",
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
