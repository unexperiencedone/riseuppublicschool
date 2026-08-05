/**
 * Static fallback content — mirrors what the seeder writes to MongoDB.
 * Keeps the site fully renderable before the API/DB is connected.
 */

export const fallbackAlbums = [
  { slug: 'annual-function-cultural-evening', title: 'Annual Function & Cultural Evening', category: 'cultural',
    description: 'Folk dances, group songs and stage performances by students from Play Group to the senior classes.',
    cover: { url: '/images/gallery/annual-function-folk-dance.jpg' }, photoCount: 7,
    photos: ['annual-function-folk-dance.jpg','cultural-dance-rajasthani.jpg','annual-day-stage-performance.jpg','dance-troupe-indoor.jpg','school-choir-singing.jpg','kindergarten-tricolour-dance.jpg','independence-day-tricolour-dance.jpg'].map((f,i)=>({url:`/images/gallery/${f}`, alt:'Annual Function — Rise UP Public School', order:i})) },
  { slug: 'sports-day-physical-education', title: 'Sports Day & Physical Education', category: 'sports',
    description: 'March past, mass drill, human pyramid and the annual medal ceremony.',
    cover: { url: '/images/gallery/march-past-sports-day.jpg' }, photoCount: 7,
    photos: ['march-past-sports-day.jpg','sports-day-medal-winners.jpg','human-pyramid-gymnastics.jpg','morning-assembly-mass-drill.jpg','karate-demonstration.jpg','karate-belt-ceremony.jpg','yoga-day-performance.jpg'].map((f,i)=>({url:`/images/gallery/${f}`, alt:'Sports Day — Rise UP Public School', order:i})) },
  { slug: 'science-exhibition-academics', title: 'Science Exhibition & Academics', category: 'academics',
    description: "Working models and projects presented by students at the Children's Day science exhibition.",
    cover: { url: '/images/gallery/science-exhibition.jpg' }, photoCount: 2,
    photos: ['science-exhibition.jpg','students-outdoor-activity.jpg'].map((f,i)=>({url:`/images/gallery/${f}`, alt:'Science Exhibition — Rise UP Public School', order:i})) },
  { slug: 'ceremonies-school-life', title: 'Ceremonies & School Life', category: 'ceremony',
    description: 'Investiture ceremony, lamp lighting, Saraswati Vandana and felicitation of achievers.',
    cover: { url: '/images/gallery/head-boy-head-girl-investiture.jpg' }, photoCount: 5,
    photos: ['head-boy-head-girl-investiture.jpg','assembly-line-up.jpg','inauguration-lamp-lighting.jpg','saraswati-vandana-garlanding.jpg','felicitation-ceremony.jpg'].map((f,i)=>({url:`/images/gallery/${f}`, alt:'School ceremonies — Rise UP Public School', order:i})) },
  { slug: 'educational-tours', title: 'Educational Tours', category: 'trip',
    description: 'Learning beyond the classroom — the annual educational excursion.',
    cover: { url: '/images/gallery/educational-tour-ayodhya.jpg' }, photoCount: 1,
    photos: [{ url: '/images/gallery/educational-tour-ayodhya.jpg', alt: 'Educational tour — Rise UP Public School', order: 0 }] },
  { slug: 'parents-community', title: 'Parents & Community', category: 'campus',
    description: 'Parent–teacher meetings and counselling sessions at the school office.',
    cover: { url: '/images/gallery/parent-teacher-meeting.jpg' }, photoCount: 2,
    photos: ['parent-teacher-meeting.jpg','principal-counselling.jpg'].map((f,i)=>({url:`/images/gallery/${f}`, alt:'Parents at Rise UP Public School', order:i})) },
];

export const fallbackNotices = [
  { slug: 'admissions-open-for-session-2026-27-play-group-to-class-xii', title: 'Admissions Open for Session 2026-27 — Play Group to Class XII',
    category: 'admission', pinned: true, publishAt: '2026-04-01T00:00:00.000Z',
    excerpt: 'Admissions for the academic session 2026-27 are now open for all classes from Play Group to Class XII.',
    body: 'Admissions for the academic session 2026-27 are now open for all classes from Play Group to Class XII.\n\nLimited seats are available in each class. Parents are requested to submit the online enquiry form on this website or visit the school office between 8:00 AM and 3:00 PM, Monday to Saturday.\n\nDocuments required: birth certificate, Transfer Certificate (Class I and above), last report card, Aadhaar copies and four passport-size photographs.\n\nFor any assistance please call 9170285353.' },
  { slug: 'academic-calendar-2026-27-released', title: 'Academic Calendar 2026-27 Released',
    category: 'academic', pinned: true, publishAt: '2026-04-01T00:00:00.000Z',
    excerpt: 'The academic calendar for the session 2026-27 is now available for download from the Downloads section.',
    body: 'The academic calendar for the session 2026-27 is now available for download from the Downloads section of this website.\n\nKey dates: New session begins 01 April 2026; Summer Break 21 May to 26 June 2026; Half Yearly Examination 07–15 September 2026; Annual Sports Day 05 December 2026; Winter Break 26 December 2026 to 10 January 2027; Annual Examination 15 February to 03 March 2027; Annual Result Declaration 15 March 2027.\n\nParents are requested to plan family travel around the examination and PTM dates.' },
  { slug: 'parent-teacher-meeting-schedule-session-2026-27', title: 'Parent-Teacher Meeting Schedule — Session 2026-27',
    category: 'circular', publishAt: '2026-04-10T00:00:00.000Z',
    excerpt: 'Four Parent-Teacher Meetings are scheduled this session. Attendance of at least one parent is compulsory.',
    body: 'Four Parent-Teacher Meetings are scheduled this session:\n\nPTM-I — 18 May 2026\nPTM-II — 25 July 2026\nPTM-III — 01 October 2026 (along with Half Yearly result declaration)\nPTM-IV — 28 November 2026 and 30 January 2027\n\nAttendance of at least one parent or guardian is compulsory. Timings will be circulated one week in advance.' },
  { slug: 'annual-sports-day-05-december-2026', title: 'Annual Sports Day — 05 December 2026',
    category: 'event', publishAt: '2026-11-01T00:00:00.000Z',
    excerpt: 'Sports Week runs 30 November to 04 December 2026, culminating in Annual Sports Day on 05 December.',
    body: 'Sports Week will be held from 30 November to 04 December 2026, culminating in the Annual Sports Day on 05 December 2026.\n\nEvents include athletics, relay races, kabaddi, kho-kho, a karate demonstration and the inter-house march past. Parents are cordially invited to attend.\n\nStudents must report in full sports uniform by 8:00 AM.' },
  { slug: 'childrens-day-celebration-science-exhibition-14-november-2026', title: "Children's Day Celebration & Science Exhibition — 14 November 2026",
    category: 'event', publishAt: '2026-10-25T00:00:00.000Z',
    excerpt: "Children's Day will be celebrated on 14 November 2026 along with the annual Science Exhibition.",
    body: "Children's Day will be celebrated on 14 November 2026 along with the annual Science Exhibition.\n\nStudents of Classes VI to XII will display working models and projects. Judging will be done by an invited panel and prizes will be awarded in three categories: Physics, Chemistry & Biology, and Applied Technology.\n\nParents and members of the community are welcome from 10:00 AM." },
];

export const fallbackStaff = [
  { name: 'Mr. Rajnish Ramakant Dubey', designation: 'Founder & Chief Executive Officer', category: 'management',
    qualifications: ['M.Sc.', 'B.Ed.'], experienceYears: 10, displayOrder: 1,
    bio: 'Founder of the Rise UP Public Shiksha Seva Samiti Trust and of the school. Over ten years in education, with a focus on bringing English-medium, CBSE-pattern schooling to rural Bhadohi.' },
  { name: 'Mr. Akshay Mishra', designation: 'Principal', category: 'management',
    qualifications: ['M.A. (Education)', 'B.Ed.'], experienceYears: 5, adminExperienceYears: 3, displayOrder: 2,
    bio: 'Leads academic planning, examinations and staff development. Five years of teaching experience and three years in school administration.' },
  { name: 'Mr. Adarsh Dubey', designation: 'School Manager', category: 'management',
    qualifications: [], experienceYears: 0, displayOrder: 3,
    bio: 'Responsible for administration, admissions, transport and campus operations.' },
];

export const fallbackDownloads = [
  { title: 'Academic Calendar 2026-27', description: 'Complete session calendar with examination dates, PTMs, holidays and events.',
    category: 'calendar', session: '2026-27', file: { name: 'academic-calendar-2026-27.pdf', url: '/academic-calendar-2026-27.pdf', mime: 'application/pdf' } },
];
