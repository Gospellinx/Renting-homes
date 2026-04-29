import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { extractSearchFilters } from "@/lib/query-filters";
import type { PropertyMatch, PropertyRecord, SearchFilters } from "@/lib/types";

const EMBEDDING_CANDIDATE_LIMIT = 12;

const describePropertyForEmbedding = (property: PropertyRecord) =>
  [
    property.title,
    property.location,
    `${property.bedrooms} bedrooms`,
    `${property.bathrooms} bathrooms`,
    property.description,
    JSON.stringify(property.features),
  ].join(" | ");

const cosineSimilarity = (left: number[], right: number[]) => {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};

export async function fetchMatchingProperties(filters: SearchFilters) {
  const db = getDb();
  const whereClauses = [];

  if (filters.location) {
    whereClauses.push(db`location ILIKE ${`%${filters.location}%`}`);
  }

  if (filters.maxPrice !== null) {
    whereClauses.push(db`price <= ${filters.maxPrice}`);
  }

  if (filters.bedrooms !== null) {
    whereClauses.push(db`bedrooms >= ${filters.bedrooms}`);
  }

  const whereFragment =
    whereClauses.length > 0 ? db`WHERE ${db.join(whereClauses, db` AND `)}` : db``;

  const rows = await db<PropertyRecord[]>`
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
    ${whereFragment}
    ORDER BY price ASC, bedrooms DESC, bathrooms DESC
    LIMIT ${EMBEDDING_CANDIDATE_LIMIT}
  `;

  return rows.map((row) => ({
    ...row,
    price: Number(row.price),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
  }));
}

export async function rerankPropertiesWithEmbeddings(query: string, properties: PropertyRecord[]) {
  if (properties.length <= 1) {
    return properties;
  }

  try {
    const openai = getOpenAIClient();
    const embeddings = await openai.embeddings.create({
      model: getEnv().OPENAI_EMBEDDING_MODEL,
      input: [query, ...properties.map(describePropertyForEmbedding)],
      encoding_format: "float",
    });

    const [queryVector, ...propertyVectors] = embeddings.data.map((item) => item.embedding);

    return properties
      .map<PropertyMatch>((property, index) => ({
        ...property,
        similarityScore: cosineSimilarity(queryVector, propertyVectors[index]),
      }))
      .sort((left, right) => (right.similarityScore ?? 0) - (left.similarityScore ?? 0))
      .slice(0, 6);
  } catch (error) {
    console.error("Embedding rerank failed, falling back to SQL ordering.", error);
    return properties.slice(0, 6);
  }
}

export async function searchPropertiesForQuery(query: string) {
  const filters = extractSearchFilters(query);
  const candidates = await fetchMatchingProperties(filters);
  const properties = await rerankPropertiesWithEmbeddings(query, candidates);

  return {
    filters,
    candidates,
    properties,
  };
}
