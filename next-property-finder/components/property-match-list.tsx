import type { PropertyMatch } from "@/lib/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const formatFeatures = (features: PropertyMatch["features"]) => {
  if (Array.isArray(features)) {
    return features.map((item) => String(item));
  }

  if (features && typeof features === "object") {
    return Object.entries(features).map(([key, value]) => `${key}: ${String(value)}`);
  }

  return [];
};

export function PropertyMatchList({ properties }: { properties: PropertyMatch[] }) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3">
      {properties.map((property) => {
        const features = formatFeatures(property.features).slice(0, 4);

        return (
          <article
            key={property.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{property.title}</h3>
                <p className="text-sm text-slate-600">{property.location}</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {formatCurrency(property.price)}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.bedrooms} bedrooms</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.bathrooms} bathrooms</span>
              {typeof property.similarityScore === "number" && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  {(property.similarityScore * 100).toFixed(0)}% relevance
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">{property.description}</p>

            {features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span
                    key={`${property.id}-${feature}`}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
