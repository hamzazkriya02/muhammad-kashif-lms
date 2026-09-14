export type LessonResource = { title: string; url: string };

export function parseLessonResources(value: unknown): LessonResource[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) throw new Error("Add up to 20 resource links per lesson.");
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || typeof item.title !== "string" || typeof item.url !== "string") {
      throw new Error(`Resource ${index + 1}: enter a title and URL.`);
    }
    const title = item.title.trim();
    const url = item.url.trim();
    if (!title || title.length > 140 || !url || url.length > 2048) {
      throw new Error(`Resource ${index + 1}: title must be 1–140 characters and URL at most 2048 characters.`);
    }
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) throw new Error();
    } catch {
      throw new Error(`Resource ${index + 1}: enter a valid http:// or https:// link without embedded credentials.`);
    }
    return { title, url };
  });
}
