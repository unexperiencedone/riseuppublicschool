import mongoose from 'mongoose';

/** Single-document site configuration — school profile, contacts, socials, toggles. */
const settingSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'site', unique: true, immutable: true },
    school: {
      name: { type: String, default: 'Rise UP Public School' },
      tagline: { type: String, default: 'English Medium | CBSE Pattern' },
      trust: { type: String, default: 'Rise UP Public Shiksha Seva Samiti Trust' },
      establishedYear: { type: Number, default: 2024 },
      affiliationNo: String,
      schoolCode: String,
      udiseCode: String,
      board: { type: String, default: 'CBSE Pattern' },
      classesOffered: { type: String, default: 'Play Group to Class XII' },
      medium: { type: String, default: 'English' },
      logo: String,
      motto: String,
    },
    contact: {
      addressLine: { type: String, default: 'Pipargaon, Aurai' },
      city: { type: String, default: 'Aurai' },
      tehsil: { type: String, default: 'Aurai' },
      district: { type: String, default: 'Sant Ravidas Nagar (Bhadohi)' },
      state: { type: String, default: 'Uttar Pradesh' },
      pincode: { type: String, default: '221301' },
      phone: { type: String, default: '9170285353' },
      altPhone: String,
      email: { type: String, default: 'riseuppublicschool48@gmail.com' },
      mapEmbedUrl: String,
      latitude: Number,
      longitude: Number,
      officeHours: { type: String, default: 'Mon–Sat, 8:00 AM – 3:00 PM' },
    },
    leadership: {
      founderName: { type: String, default: 'Mr. Rajnish Ramakant Dubey' },
      founderDesignation: { type: String, default: 'Founder & CEO' },
      principalName: { type: String, default: 'Mr. Akshay Mishra' },
      principalPhone: String,
      managerName: { type: String, default: 'Mr. Adarsh Dubey' },
      managerPhone: String,
    },
    social: { facebook: String, instagram: String, youtube: String, whatsapp: String, x: String },
    features: {
      admissionsOpen: { type: Boolean, default: true },
      onlinePaymentEnabled: { type: Boolean, default: false },
      portalEnabled: { type: Boolean, default: true },
      resultsPublic: { type: Boolean, default: false },
    },
    announcementBar: { enabled: { type: Boolean, default: true }, text: String, link: String },
    currentSession: { type: String, default: '2026-27' },
    seo: { metaTitle: String, metaDescription: String, keywords: [String], ogImage: String },
  },
  { timestamps: true }
);

settingSchema.statics.get = async function getSettings() {
  let doc = await this.findOne({ singleton: 'site' });
  if (!doc) doc = await this.create({ singleton: 'site' });
  return doc;
};

export default mongoose.model('Setting', settingSchema);
