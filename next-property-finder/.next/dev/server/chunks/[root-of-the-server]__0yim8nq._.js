module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/next-property-finder/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEnv",
    ()=>getEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const envSchema = __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    OPENAI_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "OPENAI_API_KEY is required"),
    DATABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "DATABASE_URL is required").regex(/^postgres(ql)?:\/\//i, "DATABASE_URL must be a valid PostgreSQL connection string"),
    OPENAI_CHAT_MODEL: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default("gpt-5.4-mini"),
    OPENAI_EMBEDDING_MODEL: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default("text-embedding-3-small")
});
let cachedEnv = null;
function getEnv() {
    if (cachedEnv) {
        return cachedEnv;
    }
    const parsed = envSchema.safeParse({
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
        OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
        OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL
    });
    if (!parsed.success) {
        throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue)=>issue.message).join(", ")}`);
    }
    cachedEnv = parsed.data;
    return parsed.data;
}
}),
"[project]/next-property-finder/lib/prompts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROPERTY_ASSISTANT_SYSTEM_PROMPT",
    ()=>PROPERTY_ASSISTANT_SYSTEM_PROMPT,
    "buildAssistantUserPrompt",
    ()=>buildAssistantUserPrompt
]);
const PROPERTY_ASSISTANT_SYSTEM_PROMPT = `
You are a real estate assistant.
Recommend properties ONLY from the provided data.
Never invent listings, prices, locations, or features.
If no exact match exists, say that clearly and suggest the closest options from the provided data.
Keep the response concise, helpful, and practical.
Explain why each recommended property fits the request, then ask one follow-up question when it would help narrow the search.
`.trim();
function buildAssistantUserPrompt(params) {
    const recentHistory = params.history.slice(-6);
    return [
        `User query: ${params.userMessage}`,
        `Extracted filters: ${JSON.stringify(params.filters)}`,
        `Recent chat history: ${JSON.stringify(recentHistory)}`,
        `Matched properties JSON: ${JSON.stringify(params.properties, null, 2)}`,
        "Answer in plain text. Mention only the listings in the JSON. If multiple listings match, prioritize the strongest ones first."
    ].join("\n\n");
}
}),
"[project]/next-property-finder/lib/openai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateAssistantReply",
    ()=>generateAssistantReply,
    "getOpenAIClient",
    ()=>getOpenAIClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/prompts.ts [app-route] (ecmascript)");
;
;
;
function getOpenAIClient() {
    if (!globalThis.__propertyFinderOpenAI__) {
        globalThis.__propertyFinderOpenAI__ = new __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
            apiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().OPENAI_API_KEY
        });
    }
    return globalThis.__propertyFinderOpenAI__;
}
async function generateAssistantReply(params) {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().OPENAI_CHAT_MODEL,
        temperature: 0.4,
        messages: [
            {
                role: "system",
                content: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROPERTY_ASSISTANT_SYSTEM_PROMPT"]
            },
            ...params.history.slice(-6).map((turn)=>({
                    role: turn.role,
                    content: turn.content
                })),
            {
                role: "user",
                content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAssistantUserPrompt"])(params)
            }
        ]
    });
    return completion.choices[0]?.message?.content?.trim() || "I could not prepare a recommendation just now. Please try again.";
}
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[project]/next-property-finder/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/postgres/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/env.ts [app-route] (ecmascript)");
;
;
function getDb() {
    if (!globalThis.__propertyFinderDb__) {
        globalThis.__propertyFinderDb__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().DATABASE_URL, {
            max: 1,
            prepare: false,
            idle_timeout: 10,
            connect_timeout: 15
        });
    }
    return globalThis.__propertyFinderDb__;
}
}),
"[project]/next-property-finder/lib/query-filters.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractSearchFilters",
    ()=>extractSearchFilters
]);
const bedroomWords = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6
};
const popularLocations = [
    "Abuja",
    "Lagos",
    "Port Harcourt",
    "Ibadan",
    "Lekki",
    "Ikoyi",
    "Victoria Island",
    "Ajah",
    "Ikeja",
    "Maitama",
    "Wuse",
    "Asokoro",
    "Gwarinpa",
    "Kubwa",
    "Enugu",
    "Benin City",
    "Owerri",
    "Uyo",
    "Kaduna",
    "Kano",
    "Jos",
    "Abeokuta"
].sort((left, right)=>right.length - left.length);
const normalizePrice = (rawAmount, rawUnit)=>{
    const amount = Number.parseFloat(rawAmount.replace(/,/g, ""));
    if (Number.isNaN(amount)) {
        return null;
    }
    const normalizedUnit = (rawUnit || "").toLowerCase();
    if (normalizedUnit === "billion" || normalizedUnit === "bn") {
        return amount * 1_000_000_000;
    }
    if (normalizedUnit === "million" || normalizedUnit === "m") {
        return amount * 1_000_000;
    }
    if (normalizedUnit === "thousand" || normalizedUnit === "k") {
        return amount * 1_000;
    }
    return amount;
};
const extractBedrooms = (query)=>{
    const lowered = query.toLowerCase();
    const numericMatch = lowered.match(/(\d+)\s*[- ]?(?:bed|bedroom|bedrooms)\b/);
    if (numericMatch) {
        return Number.parseInt(numericMatch[1], 10);
    }
    for (const [word, value] of Object.entries(bedroomWords)){
        if (new RegExp(`\\b${word}\\s*[- ]?(?:bed|bedroom|bedrooms)\\b`, "i").test(query)) {
            return value;
        }
    }
    return null;
};
const extractMaxPrice = (query)=>{
    const match = query.match(/\b(?:under|below|less than|within|up to|not more than)\s*(?:₦|ngn)?\s*([\d,.]+)\s*(billion|million|thousand|bn|m|k)?\b/i);
    return match ? normalizePrice(match[1], match[2]) : null;
};
const extractLocation = (query)=>{
    const knownLocation = popularLocations.find((location)=>query.toLowerCase().includes(location.toLowerCase()));
    if (knownLocation) {
        return knownLocation;
    }
    const byPhraseMatch = query.match(/\bin\s+([a-zA-Z][a-zA-Z\s-]+?)(?=\s+(?:under|below|within|with|having|for|around)\b|[?.!,]|$)/i);
    return byPhraseMatch ? byPhraseMatch[1].trim() : null;
};
function extractSearchFilters(query) {
    return {
        location: extractLocation(query),
        maxPrice: extractMaxPrice(query),
        bedrooms: extractBedrooms(query)
    };
}
}),
"[project]/next-property-finder/lib/property-search.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchMatchingProperties",
    ()=>fetchMatchingProperties,
    "rerankPropertiesWithEmbeddings",
    ()=>rerankPropertiesWithEmbeddings,
    "searchPropertiesForQuery",
    ()=>searchPropertiesForQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/openai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$query$2d$filters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/query-filters.ts [app-route] (ecmascript)");
;
;
;
;
const EMBEDDING_CANDIDATE_LIMIT = 12;
const describePropertyForEmbedding = (property)=>[
        property.title,
        property.location,
        `${property.bedrooms} bedrooms`,
        `${property.bathrooms} bathrooms`,
        property.description,
        JSON.stringify(property.features)
    ].join(" | ");
const cosineSimilarity = (left, right)=>{
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    for(let index = 0; index < left.length; index += 1){
        dot += left[index] * right[index];
        leftNorm += left[index] * left[index];
        rightNorm += right[index] * right[index];
    }
    if (leftNorm === 0 || rightNorm === 0) {
        return 0;
    }
    return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};
async function fetchMatchingProperties(filters) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
    const locationPattern = filters.location ? `%${filters.location}%` : null;
    const maxPrice = filters.maxPrice ?? null;
    const bedrooms = filters.bedrooms ?? null;
    const rows = await db`
    SELECT
      id,
      title,
      location,
      price,
      bedrooms,
      bathrooms,
      features,
      description
    FROM properties
    WHERE (${locationPattern}::TEXT IS NULL OR location ILIKE ${locationPattern ?? ""})
      AND (${maxPrice}::NUMERIC IS NULL OR price <= ${maxPrice ?? 0})
      AND (${bedrooms}::INTEGER IS NULL OR bedrooms >= ${bedrooms ?? 0})
    ORDER BY price ASC, bedrooms DESC, bathrooms DESC
    LIMIT ${EMBEDDING_CANDIDATE_LIMIT}
  `;
    return rows.map((row)=>({
            ...row,
            price: Number(row.price),
            bedrooms: Number(row.bedrooms),
            bathrooms: Number(row.bathrooms)
        }));
}
async function rerankPropertiesWithEmbeddings(query, properties) {
    if (properties.length <= 1) {
        return properties;
    }
    try {
        const openai = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenAIClient"])();
        const embeddings = await openai.embeddings.create({
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().OPENAI_EMBEDDING_MODEL,
            input: [
                query,
                ...properties.map(describePropertyForEmbedding)
            ],
            encoding_format: "float"
        });
        const [queryVector, ...propertyVectors] = embeddings.data.map((item)=>item.embedding);
        return properties.map((property, index)=>({
                ...property,
                similarityScore: cosineSimilarity(queryVector, propertyVectors[index])
            })).sort((left, right)=>(right.similarityScore ?? 0) - (left.similarityScore ?? 0)).slice(0, 6);
    } catch (error) {
        console.error("Embedding rerank failed, falling back to SQL ordering.", error);
        return properties.slice(0, 6);
    }
}
async function searchPropertiesForQuery(query) {
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$query$2d$filters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractSearchFilters"])(query);
    const candidates = await fetchMatchingProperties(filters);
    const properties = await rerankPropertiesWithEmbeddings(query, candidates);
    return {
        filters,
        candidates,
        properties
    };
}
}),
"[project]/next-property-finder/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/openai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$property$2d$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/lib/property-search.ts [app-route] (ecmascript)");
;
;
;
;
const requestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    message: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1, "Message is required").max(1000, "Message is too long"),
    history: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        role: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "user",
            "assistant"
        ]),
        content: __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(4000)
    })).default([])
});
async function POST(request) {
    try {
        const requestBody = requestSchema.parse(await request.json());
        const { filters, candidates, properties } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$property$2d$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchPropertiesForQuery"])(requestBody.message);
        const reply = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateAssistantReply"])({
            userMessage: requestBody.message,
            history: requestBody.history,
            filters,
            properties
        });
        const payload = {
            reply,
            properties,
            filters,
            rawMatchesCount: candidates.length
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(payload);
    } catch (error) {
        console.error("Property finder API error:", error);
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.issues[0]?.message || "Invalid request payload."
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : "The property finder could not process that request."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0yim8nq._.js.map