import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created, paginated } from '../utils/ApiResponse.js';
import { getPagination, buildSort } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slug.js';
import { saveFile, saveMany, deleteFile, createUploadSignature } from '../services/storage.service.js';
import { notifyContactMessage } from '../services/notification.service.js';
import recordAudit from '../middleware/audit.js';
import env from '../config/env.js';
import { fileDescriptorSchema } from '../validators/common.validator.js';
import {
  Notice, Event, GalleryAlbum, ContactMessage, Page, Download, Testimonial, Staff, Setting,
} from '../models/index.js';

/**
 * Validates a JSON-body upload descriptor (already uploaded to Cloudinary by
 * the browser — see web/lib/upload.js) before it's trusted and persisted.
 * Multipart requests never hit these; their files go through multer + saveFile/saveMany.
 */
function parseDescriptor(raw) {
  if (raw === undefined || raw === null) return undefined;
  const result = fileDescriptorSchema.safeParse(raw);
  if (!result.success) throw ApiError.unprocessable('Invalid upload descriptor', result.error.issues);
  return result.data;
}
function parseDescriptors(raw) {
  const result = z.array(fileDescriptorSchema).safeParse(raw || []);
  if (!result.success) throw ApiError.unprocessable('Invalid upload descriptor', result.error.issues);
  return result.data;
}

const ADMIN_UPLOAD_FOLDERS = ['gallery', 'notices', 'events', 'staff', 'downloads', 'students'];

/** POST /admin/uploads/signature — signed payload for a direct browser → Cloudinary upload. */
export const getUploadSignature = asyncHandler(async (req, res) => {
  if (env.storage.driver !== 'cloudinary') {
    throw ApiError.badRequest('Direct uploads require STORAGE_DRIVER=cloudinary');
  }
  const folder = ADMIN_UPLOAD_FOLDERS.includes(req.body.folder) ? req.body.folder : 'misc';
  return ok(res, await createUploadSignature(folder));
});

/* ─────────────────────────── NOTICES ─────────────────────────── */

/** GET /notices — public list (published + within publish window). */
export const listNotices = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q);
  const now = new Date();
  const filter = {
    isPublished: true,
    publishAt: { $lte: now },
    $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
  };
  if (q.category) filter.category = q.category;
  if (q.search) filter.$text = { $search: q.search };

  const [items, total] = await Promise.all([
    Notice.find(filter).sort({ pinned: -1, publishAt: -1 }).skip(skip).limit(limit)
      .select('-body').lean(),
    Notice.countDocuments(filter),
  ]);
  return paginated(res, items, { page, limit, total });
});

/** GET /notices/:slug */
export const getNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();
  if (!notice) throw ApiError.notFound('Notice not found');
  return ok(res, notice);
});

/** POST /admin/notices — multipart (local dev) or JSON with pre-uploaded attachments[]. */
export const createNotice = asyncHandler(async (req, res) => {
  const { attachments: jsonAttachments, ...body } = req.body;
  const attachments = req.is('application/json') ? (jsonAttachments || []) : await saveMany(req.files || [], 'notices');
  const notice = await Notice.create({
    ...body,
    slug: await uniqueSlug(Notice, body.title),
    excerpt: body.excerpt || String(body.body).replace(/<[^>]+>/g, '').slice(0, 220),
    attachments,
    author: req.user._id,
  });
  await recordAudit(req, { action: 'notice.create', entity: 'Notice', entityId: notice._id, after: { title: notice.title } });
  return created(res, notice, 'Notice published');
});

/** PATCH /admin/notices/:id */
export const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw ApiError.notFound('Notice not found');
  const before = notice.toObject();
  const { attachments: newAttachments, ...rest } = req.body;

  if (rest.title && rest.title !== notice.title) {
    notice.slug = await uniqueSlug(Notice, rest.title, notice._id);
  }
  Object.assign(notice, rest);
  if (req.is('application/json')) {
    const parsed = parseDescriptors(newAttachments);
    if (parsed.length) notice.attachments.push(...parsed);
  } else if (req.files?.length) {
    notice.attachments.push(...(await saveMany(req.files, 'notices')));
  }
  await notice.save();

  await recordAudit(req, { action: 'notice.update', entity: 'Notice', entityId: notice._id, before: { title: before.title }, after: { title: notice.title } });
  return ok(res, notice, 'Notice updated');
});

/** DELETE /admin/notices/:id */
export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) throw ApiError.notFound('Notice not found');
  await Promise.all((notice.attachments || []).map((a) => deleteFile(a.publicId)));
  await recordAudit(req, { action: 'notice.delete', entity: 'Notice', entityId: req.params.id });
  return ok(res, null, 'Notice deleted');
});

/* ─────────────────────────── EVENTS ─────────────────────────── */

/** GET /events — supports ?from&to for calendar views. */
export const listEvents = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const filter = { isPublished: true };
  if (q.session) filter.session = q.session;
  if (q.category) filter.category = q.category;
  if (q.from || q.to) {
    filter.startDate = {};
    if (q.from) filter.startDate.$gte = new Date(q.from);
    if (q.to) filter.startDate.$lte = new Date(q.to);
  }
  const items = await Event.find(filter).sort({ startDate: 1 }).limit(500).lean();
  return ok(res, items);
});

/** GET /events/upcoming */
export const upcomingEvents = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 6);
  const items = await Event.find({ isPublished: true, startDate: { $gte: new Date() } })
    .sort({ startDate: 1 }).limit(limit).lean();
  return ok(res, items);
});

/** GET /events/:slug */
export const getEvent = asyncHandler(async (req, res) => {
  const item = await Event.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!item) throw ApiError.notFound('Event not found');
  return ok(res, item);
});

export const createEvent = asyncHandler(async (req, res) => {
  const { cover: jsonCover, ...body } = req.body;
  const cover = req.is('application/json') ? jsonCover : (req.file ? await saveFile(req.file, 'events') : undefined);
  const event = await Event.create({ ...body, slug: await uniqueSlug(Event, body.title), cover });
  await recordAudit(req, { action: 'event.create', entity: 'Event', entityId: event._id });
  return created(res, event, 'Event created');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  const { cover: jsonCover, ...rest } = req.body;
  if (rest.title && rest.title !== event.title) event.slug = await uniqueSlug(Event, rest.title, event._id);
  Object.assign(event, rest);
  if (req.is('application/json')) {
    const parsed = parseDescriptor(jsonCover);
    if (parsed) event.cover = parsed;
  } else if (req.file) {
    event.cover = await saveFile(req.file, 'events');
  }
  await event.save();
  return ok(res, event, 'Event updated');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  await deleteFile(event.cover?.publicId);
  return ok(res, null, 'Event deleted');
});

/* ─────────────────────────── GALLERY ─────────────────────────── */

export const listAlbums = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q);
  const filter = { isPublished: true };
  if (q.category) filter.category = q.category;
  const [items, total] = await Promise.all([
    GalleryAlbum.find(filter).sort({ displayOrder: 1, eventDate: -1 }).skip(skip).limit(limit)
      .select('title slug description category eventDate cover photos displayOrder').lean(),
    GalleryAlbum.countDocuments(filter),
  ]);
  const shaped = items.map((a) => ({ ...a, photoCount: a.photos?.length || 0, photos: undefined }));
  return paginated(res, shaped, { page, limit, total });
});

export const getAlbum = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!album) throw ApiError.notFound('Album not found');
  return ok(res, album);
});

export const createAlbum = asyncHandler(async (req, res) => {
  const { photos: jsonPhotos, ...body } = req.body;
  const photos = req.is('application/json') ? (jsonPhotos || []) : await saveMany(req.files || [], 'gallery');
  const album = await GalleryAlbum.create({
    ...body,
    slug: await uniqueSlug(GalleryAlbum, body.title),
    photos: photos.map((p, i) => ({ ...p, order: i, alt: `${body.title} — photo ${i + 1}` })),
    cover: photos[0] ? { url: photos[0].url, publicId: photos[0].publicId, alt: body.title } : undefined,
  });
  return created(res, album, 'Album created');
});

export const addAlbumPhotos = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findById(req.params.id);
  if (!album) throw ApiError.notFound('Album not found');
  const photos = req.is('application/json') ? parseDescriptors(req.body.photos) : await saveMany(req.files || [], 'gallery');
  album.photos.push(...photos.map((p, i) => ({ ...p, order: album.photos.length + i })));
  if (!album.cover?.url && photos[0]) album.cover = { url: photos[0].url, publicId: photos[0].publicId };
  await album.save();
  return ok(res, album, `${photos.length} photo(s) added`);
});

export const deleteAlbumPhoto = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findById(req.params.id);
  if (!album) throw ApiError.notFound('Album not found');
  const photo = album.photos.id(req.params.photoId);
  if (!photo) throw ApiError.notFound('Photo not found');
  await deleteFile(photo.publicId);
  photo.deleteOne();
  await album.save();
  return ok(res, album, 'Photo removed');
});

export const deleteAlbum = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findByIdAndDelete(req.params.id);
  if (!album) throw ApiError.notFound('Album not found');
  await Promise.all((album.photos || []).map((p) => deleteFile(p.publicId)));
  return ok(res, null, 'Album deleted');
});

/* ─────────────────────────── CONTACT ─────────────────────────── */

export const createContactMessage = asyncHandler(async (req, res) => {
  if (req.body.website) throw ApiError.badRequest('Submission rejected');
  const msg = await ContactMessage.create({ ...req.body, ipAddress: req.ip });
  notifyContactMessage(msg).catch(() => {});
  return created(res, { id: msg._id }, 'Thank you for writing to us. We will respond within 2 working days.');
});

export const listContactMessages = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q, { defaultLimit: 20 });
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.category) filter.category = q.category;
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort(buildSort(q.sort)).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  return paginated(res, items, { page, limit, total });
});

export const updateContactMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, responseNote: req.body.responseNote, respondedBy: req.user._id },
    { new: true }
  );
  if (!msg) throw ApiError.notFound('Message not found');
  return ok(res, msg, 'Message updated');
});

/* ─────────────────────────── PAGES / DOWNLOADS / TESTIMONIALS / STAFF / SETTINGS ─────────────────────────── */

export const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ key: req.params.key, isPublished: true }).lean();
  if (!page) throw ApiError.notFound('Page not found');
  return ok(res, page);
});

export const upsertPage = asyncHandler(async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { key: req.params.key },
    { ...req.body, key: req.params.key, updatedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await recordAudit(req, { action: 'page.upsert', entity: 'Page', entityId: page._id });
  return ok(res, page, 'Page saved');
});

export const listDownloads = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  const items = await Download.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
  return ok(res, items);
});

export const createDownload = asyncHandler(async (req, res) => {
  const { file: jsonFile, ...body } = req.body;
  let file;
  if (req.is('application/json')) {
    file = parseDescriptor(jsonFile);
    if (!file) throw ApiError.badRequest('A file is required');
  } else {
    if (!req.file) throw ApiError.badRequest('A file is required');
    file = await saveFile(req.file, 'downloads');
  }
  const item = await Download.create({ ...body, file });
  return created(res, item, 'File uploaded');
});

export const deleteDownload = asyncHandler(async (req, res) => {
  const item = await Download.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('File not found');
  await deleteFile(item.file?.publicId);
  return ok(res, null, 'File deleted');
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ isApproved: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(24).lean();
  return ok(res, items);
});

export const submitTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.create({ ...req.body, isApproved: false });
  return created(res, { id: item._id }, 'Thank you! Your feedback will appear after review.');
});

export const moderateTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
  if (!item) throw ApiError.notFound('Testimonial not found');
  return ok(res, item, req.body.isApproved ? 'Approved' : 'Unapproved');
});

export const listStaff = asyncHandler(async (req, res) => {
  const filter = { showOnWebsite: true, isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.department) filter.department = req.query.department;
  const items = await Staff.find(filter).sort({ displayOrder: 1, name: 1 })
    .select('-email -phone').lean();
  return ok(res, items);
});

export const createStaff = asyncHandler(async (req, res) => {
  const { photo: jsonPhoto, ...body } = req.body;
  const photo = req.is('application/json') ? jsonPhoto : (req.file ? await saveFile(req.file, 'staff') : undefined);
  const item = await Staff.create({ ...body, photo });
  return created(res, item, 'Staff member added');
});

export const updateStaff = asyncHandler(async (req, res) => {
  const item = await Staff.findById(req.params.id);
  if (!item) throw ApiError.notFound('Staff member not found');
  const { photo: jsonPhoto, ...rest } = req.body;
  Object.assign(item, rest);
  if (req.is('application/json')) {
    const parsed = parseDescriptor(jsonPhoto);
    if (parsed) item.photo = parsed;
  } else if (req.file) {
    item.photo = await saveFile(req.file, 'staff');
  }
  await item.save();
  return ok(res, item, 'Staff member updated');
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const item = await Staff.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Staff member not found');
  await deleteFile(item.photo?.publicId);
  return ok(res, null, 'Staff member removed');
});

export const getSettings = asyncHandler(async (_req, res) => ok(res, await Setting.get()));

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOneAndUpdate({ singleton: 'site' }, req.body, { new: true, upsert: true });
  await recordAudit(req, { action: 'settings.update', entity: 'Setting', entityId: settings._id });
  return ok(res, settings, 'Settings saved');
});
