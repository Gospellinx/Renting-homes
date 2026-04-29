module.exports = [
"[project]/next-property-finder/components/property-match-list.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PropertyMatchList",
    ()=>PropertyMatchList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const formatCurrency = (value)=>new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(value);
const formatFeatures = (features)=>{
    if (Array.isArray(features)) {
        return features.map((item)=>String(item));
    }
    if (features && typeof features === "object") {
        return Object.entries(features).map(([key, value])=>`${key}: ${String(value)}`);
    }
    return [];
};
function PropertyMatchList({ properties }) {
    if (properties.length === 0) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3",
        children: properties.map((property)=>{
            const features = formatFeatures(property.features).slice(0, 4);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                className: "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-start justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-semibold text-slate-900",
                                        children: property.title
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                        lineNumber: 39,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-600",
                                        children: property.location
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                        lineNumber: 40,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 38,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700",
                                children: formatCurrency(property.price)
                            }, void 0, false, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                        lineNumber: 37,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex flex-wrap gap-2 text-xs text-slate-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-slate-100 px-2.5 py-1",
                                children: [
                                    property.bedrooms,
                                    " bedrooms"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 48,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-slate-100 px-2.5 py-1",
                                children: [
                                    property.bathrooms,
                                    " bathrooms"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this),
                            typeof property.similarityScore === "number" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700",
                                children: [
                                    (property.similarityScore * 100).toFixed(0),
                                    "% relevance"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 51,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                        lineNumber: 47,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-sm leading-6 text-slate-700",
                        children: property.description
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, this),
                    features.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex flex-wrap gap-2",
                        children: features.map((feature)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600",
                                children: feature
                            }, `${property.id}-${feature}`, false, {
                                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                                lineNumber: 62,
                                columnNumber: 19
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                        lineNumber: 60,
                        columnNumber: 15
                    }, this)
                ]
            }, property.id, true, {
                fileName: "[project]/next-property-finder/components/property-match-list.tsx",
                lineNumber: 33,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/next-property-finder/components/property-match-list.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/next-property-finder/components/ai-search-results.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AISearchResults",
    ()=>AISearchResults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$components$2f$property$2d$match$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/components/property-match-list.tsx [app-ssr] (ecmascript)");
"use client";
;
;
const LoadingPreview = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-4 w-28 rounded-full bg-slate-200"
            }, void 0, false, {
                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                lineNumber: 14,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-16 rounded-2xl bg-slate-100"
            }, void 0, false, {
                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                lineNumber: 15,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 md:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-36 rounded-2xl bg-slate-100"
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 17,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-36 rounded-2xl bg-slate-100"
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 18,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                lineNumber: 16,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
        lineNumber: 13,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
function AISearchResults({ messages, isLoading, error }) {
    const visibleMessages = messages.filter((message)=>!message.isTransient);
    const lastAssistantMessage = [
        ...visibleMessages
    ].reverse().find((message)=>message.role === "assistant");
    if (visibleMessages.length === 0 && !isLoading && !error) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mt-5 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-slate-100 px-5 py-4 md:px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-[0.16em] text-slate-400",
                        children: "AI search results"
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-1 text-lg font-semibold text-slate-900",
                        children: "Live recommendations on this page"
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-5 px-5 py-5 md:px-6",
                children: [
                    visibleMessages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: visibleMessages.slice(-4).map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400",
                                        children: message.role === "user" ? "You asked" : "AI summary"
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                        lineNumber: 43,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: message.role === "user" ? "rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700" : "rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-800",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "whitespace-pre-wrap",
                                            children: message.content
                                        }, void 0, false, {
                                            fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                            lineNumber: 53,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                        lineNumber: 46,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, message.id, true, {
                                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-sm text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex h-2.5 w-2.5 rounded-full bg-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                        lineNumber: 63,
                                        columnNumber: 15
                                    }, this),
                                    "Searching matching homes and preparing the AI response..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingPreview, {}, void 0, false, {
                                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    lastAssistantMessage?.properties && lastAssistantMessage.properties.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-semibold text-slate-900",
                                        children: "Matching properties"
                                    }, void 0, false, {
                                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                        lineNumber: 79,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-slate-500",
                                        children: [
                                            lastAssistantMessage.properties.length,
                                            " result",
                                            lastAssistantMessage.properties.length === 1 ? "" : "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$components$2f$property$2d$match$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PropertyMatchList"], {
                                properties: lastAssistantMessage.properties
                            }, void 0, false, {
                                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    !isLoading && !error && lastAssistantMessage && lastAssistantMessage.properties?.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
                        children: "No exact property cards came back for that query yet. Try a looser budget, another location, or fewer must-have features."
                    }, void 0, false, {
                        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/next-property-finder/components/ai-search-results.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/next-property-finder/components/property-finder-chat.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PropertyFinderChat",
    ()=>PropertyFinderChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$components$2f$ai$2d$search$2d$results$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/next-property-finder/components/ai-search-results.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
const STORAGE_KEY = "next-property-finder-chat";
const suggestionChips = [
    "2 bedroom in Abuja",
    "cheap rent",
    "luxury villa",
    "house near Lekki with pool",
    "studio close to university"
];
const buildId = ()=>`${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
function PropertyFinderChat() {
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const resultsAnchorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const savedMessages = window.localStorage.getItem(STORAGE_KEY);
            if (!savedMessages) {
                return;
            }
            const parsed = JSON.parse(savedMessages);
            if (Array.isArray(parsed)) {
                setMessages(parsed);
            }
        } catch  {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((message)=>!message.isTransient)));
    }, [
        messages
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (messages.length > 0 || isLoading || error) {
            resultsAnchorRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [
        messages,
        isLoading,
        error
    ]);
    const requestHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>messages.filter((message)=>!message.isTransient).map((message)=>({
                role: message.role,
                content: message.content
            })), [
        messages
    ]);
    const sendMessage = async (content)=>{
        const trimmed = content.trim();
        if (!trimmed || isLoading) {
            return;
        }
        const userMessage = {
            id: buildId(),
            role: "user",
            content: trimmed
        };
        const loadingMessage = {
            id: "assistant-loading",
            role: "assistant",
            content: "Searching listings and writing a recommendation...",
            isTransient: true
        };
        setInput("");
        setError(null);
        setIsLoading(true);
        setMessages((current)=>[
                ...current.filter((message)=>!message.isTransient),
                userMessage,
                loadingMessage
            ]);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: trimmed,
                    history: [
                        ...requestHistory,
                        {
                            role: "user",
                            content: trimmed
                        }
                    ]
                })
            });
            const payload = await response.json();
            if (!response.ok || !("reply" in payload)) {
                throw new Error("error" in payload && payload.error || "The property finder could not complete that request.");
            }
            const assistantMessage = {
                id: buildId(),
                role: "assistant",
                content: payload.reply,
                properties: payload.properties
            };
            setMessages((current)=>[
                    ...current.filter((message)=>!message.isTransient),
                    assistantMessage
                ]);
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : "Something went wrong while contacting the property finder.";
            setMessages((current)=>current.filter((message)=>!message.isTransient));
            setError(message);
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-hidden rounded-[36px] bg-slate-900 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]",
                style: {
                    backgroundImage: "linear-gradient(180deg, rgba(15,23,42,0.28), rgba(15,23,42,0.58)), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80')",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-10 md:px-8 md:py-14",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto max-w-5xl text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl",
                                    children: "Find the exact home you're looking for"
                                }, void 0, false, {
                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mx-auto mt-6 max-w-4xl text-lg leading-8 text-white/92 md:text-[2rem] md:leading-[1.4]",
                                    children: "Jitty helps you cut through irrelevant listings, discover new areas by commute time and learn more about every home."
                                }, void 0, false, {
                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto mt-10 max-w-5xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[34px] border border-white/70 bg-white/96 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: (event)=>{
                                        event.preventDefault();
                                        void sendMessage(input);
                                    },
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative overflow-hidden rounded-[30px] border border-slate-200 bg-white",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    value: input,
                                                    onChange: (event)=>setInput(event.target.value),
                                                    onKeyDown: (event)=>{
                                                        if (event.key === "Enter" && !event.shiftKey) {
                                                            event.preventDefault();
                                                            void sendMessage(input);
                                                        }
                                                    },
                                                    placeholder: "Describe the home you're looking for...",
                                                    className: "min-h-[160px] w-full resize-none border-0 bg-transparent px-6 py-6 pr-24 text-2xl leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 md:min-h-[190px]"
                                                }, void 0, false, {
                                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: isLoading,
                                                    className: "absolute bottom-5 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300",
                                                    "aria-label": "Send AI search",
                                                    children: isLoading ? "..." : "->"
                                                }, void 0, false, {
                                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                            lineNumber: 160,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[28px] bg-slate-50/90 px-5 py-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-2xl font-medium text-slate-500",
                                                    children: "Be inspired..."
                                                }, void 0, false, {
                                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-5 flex flex-wrap gap-3",
                                                    children: suggestionChips.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>void sendMessage(chip),
                                                            className: "rounded-full border border-violet-200 bg-white px-4 py-2 text-lg font-medium text-indigo-500 transition hover:border-indigo-300 hover:bg-indigo-50",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "mr-2 text-indigo-300",
                                                                    children: "*"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                                    lineNumber: 194,
                                                                    columnNumber: 25
                                                                }, this),
                                                                chip
                                                            ]
                                                        }, chip, true, {
                                                            fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                            lineNumber: 188,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                            lineNumber: 184,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: resultsAnchorRef
            }, void 0, false, {
                fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `transition-all duration-300 ease-out ${messages.length > 0 || isLoading || error ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$next$2d$property$2d$finder$2f$components$2f$ai$2d$search$2d$results$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AISearchResults"], {
                    messages: messages,
                    isLoading: isLoading,
                    error: error
                }, void 0, false, {
                    fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                    lineNumber: 212,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/next-property-finder/components/property-finder-chat.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
}),
"[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/next-property-finder/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=next-property-finder_0k2xa3-._.js.map