/**
 * Idempotent database seeder.
 *   npm run seed          → upsert seed content, keep existing data
 *   npm run seed:fresh    → DROP the seeded collections first
 */
import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { toSlug } from '../utils/slug.js';
import {
  User, Staff, Notice, Event, GalleryAlbum, Page, Setting, FeeStructure, AcademicClass, Download,
} from '../models/index.js';
import academicCalendar from './data/calendar.js';
import galleryAlbums from './data/gallery.js';
import pages from './data/pages.js';
import staffMembers from './data/staff.js';
import notices from './data/notices.js';
import feeStructures from './data/fees.js';
import { CLASS_LEVELS } from '../utils/constants.js';

const FRESH = process.argv.includes('--fresh');
const SESSION = '2026-27';
const GALLERY_BASE = '/images/gallery';

const stageFor = (level) => {
  if (['Play Group', 'Nursery', 'LKG', 'UKG'].includes(level)) return 'pre_primary';
  if (['I', 'II', 'III', 'IV', 'V'].includes(level)) return 'primary';
  if (['VI', 'VII', 'VIII'].includes(level)) return 'middle';
  if (['IX', 'X'].includes(level)) return 'secondary';
  return 'senior_secondary';
};

async function seedSettings() {
  await Setting.findOneAndUpdate(
    { singleton: 'site' },
    {
      school: {
        name: 'Rise UP Public School',
        tagline: 'English Medium | CBSE Pattern',
        trust: 'Rise UP Public Shiksha Seva Samiti Trust',
        establishedYear: 2024,
        board: 'CBSE Pattern',
        classesOffered: 'Play Group to Class XII',
        medium: 'English',
        logo: '/images/brand/logo.png',
        motto: 'Rise Up — Learn, Lead, Serve',
      },
      contact: {
        addressLine: 'Pipargaon, Aurai', city: 'Aurai', tehsil: 'Aurai',
        district: 'Sant Ravidas Nagar (Bhadohi)', state: 'Uttar Pradesh', pincode: '221301',
        phone: '9170285353', email: 'riseuppublicschool48@gmail.com',
        officeHours: 'Monday – Saturday, 8:00 AM – 3:00 PM',
      },
      leadership: {
        founderName: 'Mr. Rajnish Ramakant Dubey', founderDesignation: 'Founder & CEO',
        principalName: 'Mr. Akshay Mishra', principalPhone: '9450338917',
        managerName: 'Mr. Adarsh Dubey', managerPhone: '8052397504',
      },
      features: { admissionsOpen: true, onlinePaymentEnabled: false, portalEnabled: true, resultsPublic: false },
      announcementBar: { enabled: true, text: 'Admissions open for Session 2026-27 — Play Group to Class XII', link: '/admissions' },
      currentSession: SESSION,
      seo: {
        metaTitle: 'Rise UP Public School, Pipargaon Aurai Bhadohi | English Medium CBSE Pattern',
        metaDescription: 'Rise UP Public School, Pipargaon (Aurai), Bhadohi — English medium, CBSE pattern school for Play Group to Class XII. Admissions open for 2026-27. Call 9170285353.',
        keywords: ['school in Aurai', 'CBSE school Bhadohi', 'English medium school Pipargaon', 'Rise UP Public School', 'best school Sant Ravidas Nagar'],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  logger.info('✓ Site settings');
}

async function seedAdmin() {
  const existing = await User.findOne({ email: env.seed.email });
  if (existing) { logger.info('· Admin already exists — skipped'); return; }
  await User.create({
    name: env.seed.name, email: env.seed.email, password: env.seed.password,
    role: 'super_admin', mustChangePassword: true,
  });
  logger.warn(`✓ Super admin created → ${env.seed.email} / ${env.seed.password}  (CHANGE THIS PASSWORD)`);
}

async function seedStaff() {
  for (const s of staffMembers) {
    await Staff.findOneAndUpdate({ name: s.name }, s, { upsert: true, setDefaultsOnInsert: true });
  }
  logger.info(`✓ ${staffMembers.length} staff members`);
}

async function seedPages() {
  for (const p of pages) {
    await Page.findOneAndUpdate({ key: p.key }, p, { upsert: true, setDefaultsOnInsert: true });
  }
  logger.info(`✓ ${pages.length} CMS pages`);
}

async function seedNotices() {
  const admin = await User.findOne({ role: 'super_admin' });
  for (const n of notices) {
    await Notice.findOneAndUpdate(
      { slug: toSlug(n.title) },
      { ...n, slug: toSlug(n.title), excerpt: n.body.split('\n')[0].slice(0, 220), author: admin?._id, isPublished: true, publishAt: new Date() },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`✓ ${notices.length} notices`);
}

async function seedEvents() {
  let count = 0;
  for (const e of academicCalendar) {
    const slug = toSlug(`${e.title}-${e.date}`);
    await Event.findOneAndUpdate(
      { slug },
      {
        slug, title: e.title, category: e.category, isHoliday: !!e.isHoliday,
        startDate: new Date(`${e.date}T00:00:00.000Z`),
        endDate: e.endDate ? new Date(`${e.endDate}T00:00:00.000Z`) : undefined,
        session: SESSION, allDay: true, isPublished: true,
        venue: e.isHoliday ? '—' : 'School Campus',
        description: `${e.title} — Academic Calendar ${SESSION}.`,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    count += 1;
  }
  logger.info(`✓ ${count} academic calendar events`);
}

async function seedGallery() {
  for (const [i, a] of galleryAlbums.entries()) {
    const slug = toSlug(a.title);
    const photos = a.photos.map((file, idx) => ({
      url: `${GALLERY_BASE}/${file}`,
      publicId: file,
      alt: `${a.title} — Rise UP Public School`,
      caption: file.replace(/\.jpg$/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      order: idx,
    }));
    await GalleryAlbum.findOneAndUpdate(
      { slug },
      {
        slug, title: a.title, description: a.description, category: a.category,
        photos, cover: { url: photos[0].url, alt: a.title },
        isPublished: true, displayOrder: (i + 1) * 10,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`✓ ${galleryAlbums.length} gallery albums`);
}

async function seedClasses() {
  for (const level of CLASS_LEVELS) {
    await AcademicClass.findOneAndUpdate(
      { level, section: 'A', session: SESSION },
      { level, section: 'A', session: SESSION, stage: stageFor(level), isActive: true },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`✓ ${CLASS_LEVELS.length} classes`);
}

async function seedFees() {
  for (const f of feeStructures) {
    await FeeStructure.findOneAndUpdate(
      { classLevel: f.classLevel, session: SESSION },
      { ...f, session: SESSION },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`✓ ${feeStructures.length} fee structure rows (unpublished placeholders)`);
}

async function seedDownloads() {
  await Download.findOneAndUpdate(
    { title: 'Academic Calendar 2026-27' },
    {
      title: 'Academic Calendar 2026-27',
      description: 'Complete session calendar with examination dates, PTMs, holidays and events.',
      category: 'calendar', session: SESSION, displayOrder: 1, isPublished: true,
      file: { name: 'academic-calendar-2026-27.pdf', url: '/academic-calendar-2026-27.pdf', mime: 'application/pdf' },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  logger.info('✓ Downloads');
}

async function run() {
  await connectDB();

  if (FRESH) {
    logger.warn('--fresh → dropping seeded collections');
    await Promise.all([
      Staff.deleteMany({}), Notice.deleteMany({}), Event.deleteMany({}),
      GalleryAlbum.deleteMany({}), Page.deleteMany({}), FeeStructure.deleteMany({}),
      AcademicClass.deleteMany({}), Download.deleteMany({}), Setting.deleteMany({}),
    ]);
  }

  await seedSettings();
  await seedAdmin();
  await seedStaff();
  await seedPages();
  await seedNotices();
  await seedEvents();
  await seedGallery();
  await seedClasses();
  await seedFees();
  await seedDownloads();

  logger.info('Seed complete.');
  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  logger.error(`Seed failed: ${err.message}`, { stack: err.stack });
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
