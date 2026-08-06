/** Single source of truth for school particulars used across the site. */
export const SCHOOL = {
  name: 'Rise UP Public School',
  shortName: 'RUPS',
  tagline: 'English Medium  |  CBSE Pattern',
  motto: 'Learn. Lead. Rise Up.',
  trust: 'Rise UP Public Shiksha Seva Samiti Trust',
  established: 2024,
  classesOffered: 'Play Group to Class XII',
  medium: 'English',
  address: {
    line1: 'Pipargaon, Aurai',
    city: 'Aurai',
    tehsil: 'Aurai',
    district: 'Sant Ravidas Nagar (Bhadohi)',
    state: 'Uttar Pradesh',
    pincode: '221301',
    full: 'Pipargaon, Aurai, Sant Ravidas Nagar (Bhadohi), Uttar Pradesh 221301',
  },
  phone: '9170285353',
  phoneDisplay: '+91 91702 85353',
  whatsapp: '919170285353',
  email: 'riseuppublicschool48@gmail.com',
  officeHours: 'Monday – Saturday, 8:00 AM – 3:00 PM',
  leadership: {
    founder: { name: 'Mr. Rajnish Ramakant Dubey', role: 'Founder & CEO', qualifications: 'M.Sc., B.Ed.', experience: '10+ years in education' },
    principal: { name: 'Mr. Akshay Mishra', role: 'Principal', qualifications: 'M.A. (Education), B.Ed.', experience: '5 years teaching, 3 years administration', phone: '9450338917' },
    manager: { name: 'Mr. Adarsh Dubey', role: 'School Manager', phone: '8052397504' },
  },
  session: '2026-27',

  /**
   * Fill these in as the school's accounts go live.
   * Every non-empty https URL is emitted as schema.org `sameAs`, which is how
   * Google links the website to the social profiles in a knowledge panel.
   * twitterHandle drives twitter:site / twitter:creator — include the @.
   */
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    twitter: '',
    twitterHandle: '',
    whatsapp: 'https://wa.me/919170285353',
  },
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000/api/v1';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const REVALIDATE = Number(process.env.REVALIDATE_SECONDS || 300);

export const NAV = [
  { label: 'Home', href: '/' },
  {
    label: 'About', href: '/about',
    children: [
      { label: 'About the School', href: '/about' },
      { label: "Founder's Message", href: '/about/founder-message' },
      { label: "Principal's Message", href: '/about/principal-message' },
      { label: 'Vision & Mission', href: '/about#vision' },
    ],
  },
  {
    label: 'Academics', href: '/academics',
    children: [
      { label: 'Curriculum & Stages', href: '/academics' },
      { label: 'Academic Calendar', href: '/academics/calendar' },
      { label: 'Examination Pattern', href: '/academics#examinations' },
      { label: 'Faculty', href: '/faculty' },
    ],
  },
  {
    label: 'Admissions', href: '/admissions',
    children: [
      { label: 'Admission Process', href: '/admissions' },
      { label: 'Apply Online', href: '/admissions#enquiry' },
      { label: 'Track Application', href: '/admissions/track' },
      { label: 'Fee Structure', href: '/admissions/fees' },
    ],
  },
  { label: 'Facilities', href: '/facilities' },
  {
    label: 'Campus Life', href: '/gallery',
    children: [
      { label: 'Photo Gallery', href: '/gallery' },
      { label: 'Events', href: '/events' },
      { label: 'Notices & Circulars', href: '/notices' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const QUICK_LINKS = [
  { label: 'Mandatory Public Disclosure', href: '/mandatory-disclosure' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Notices & Circulars', href: '/notices' },
  { label: 'Academic Calendar', href: '/academics/calendar' },
  { label: 'Fee Structure', href: '/admissions/fees' },
  { label: 'Parent Portal', href: '/portal/login' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];
