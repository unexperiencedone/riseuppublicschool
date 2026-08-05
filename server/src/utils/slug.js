import slugify from 'slugify';
export const toSlug = (str) => slugify(String(str || ''), { lower: true, strict: true, trim: true });

/** Generates a unique slug against a mongoose model. */
export async function uniqueSlug(Model, source, currentId = null) {
  const base = toSlug(source) || 'item';
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${base}-${i += 1}`;
  }
  return slug;
}
