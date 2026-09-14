// Stable category colors: pagination and refreshes never change a badge's color.
const palette = [
  { backgroundColor: "#E0E7FF", color: "#4338CA", borderColor: "#A5B4FC" },
  { backgroundColor: "#D1FAE5", color: "#047857", borderColor: "#6EE7B7" },
  { backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" },
  { backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#C4B5FD" },
  { backgroundColor: "#DBEAFE", color: "#1D4ED8", borderColor: "#93C5FD" },
  { backgroundColor: "#FFE4E6", color: "#BE123C", borderColor: "#FDA4AF" },
  { backgroundColor: "#CCFBF1", color: "#0F766E", borderColor: "#5EEAD4" },
  { backgroundColor: "#FAE8FF", color: "#A21CAF", borderColor: "#E879F9" },
];

export function categoryColor(category) {
  const key = String(category || "").trim().toLowerCase().replace(/\s+/g, " ");
  let hash = 0;
  for (const character of key) hash = (Math.imul(hash, 31) + character.codePointAt(0)) >>> 0;
  return palette[hash % palette.length];
}
