// Safe helper: ALWAYS returns a string
function pickCategory(a: any): string {
  // pick the “category-ish” source from various shapes
  const src =
    a?.category ??
    a?.section ??
    a?.rubrique ??
    a?.category_name ??
    a?.section_name ??
    a?.rubrique_name ??
    null;

  const toText = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return toText(v[0]); // take first if array
    if (typeof v === "object") {
      const cand =
        v.name ??
        v.label ??
        v.title ??
        v.slug ??
        // fallback: first string value inside the object
        Object.values(v).find((x) => typeof x === "string") ??
        "";
      return String(cand);
    }
    return String(v);
  };

  return toText(src);
}
