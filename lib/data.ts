import type { Application, Listing, Profile } from './types';

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Sun-soaked corner flat with parquet',
    neighborhood: 'Kreis 4',
    street: 'Badenerstrasse 121',
    rooms: 2.5,
    sqm: 68,
    price: 2390,
    floor: '3rd of 5',
    year: 1908,
    distance: '1.4 km from HB',
    available: '1 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    ],
    features: ['Balcony', 'Dishwasher', 'Laundry in building', 'Pets ok'],
    note:
      'Top-floor light all afternoon, double-glazed windows, and the bakery downstairs opens at 6. The kitchen is small but the living room makes up for it.',
    coords: '47.3769,8.5197',
  },
  {
    id: 'l2',
    title: 'Quiet 3.5 near Letten river',
    neighborhood: 'Kreis 5',
    street: 'Heinrichstrasse 230',
    rooms: 3.5,
    sqm: 84,
    price: 2890,
    floor: '2nd of 4',
    year: 1976,
    distance: '1.1 km from HB',
    available: '15 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
    ],
    features: ['Balcony', 'Dishwasher', 'Elevator', 'Laundry in flat'],
    note:
      "Set back from the road so it's genuinely quiet. Five minutes to Letten in summer, ten to Langstrasse if you want noise back.",
    coords: '47.3897,8.5305',
  },
  {
    id: 'l3',
    title: 'Studio with walk-in closet',
    neighborhood: 'Kreis 4',
    street: 'Zweierstrasse 56',
    rooms: 1.5,
    sqm: 42,
    price: 1890,
    floor: '1st of 6',
    year: 2004,
    distance: '1.8 km from HB',
    available: '1 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1522444690501-c0bc55c41eed?w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
      'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
    ],
    features: ['Furnished', 'Dishwasher', 'Elevator'],
    note:
      'Compact but considered — walk-in closet doubles as a tiny home office. Whole place was redone last spring.',
    coords: '47.3711,8.5253',
  },
  {
    id: 'l4',
    title: 'Altbau with stucco ceilings',
    neighborhood: 'Kreis 6',
    street: 'Universitätstrasse 88',
    rooms: 3.5,
    sqm: 92,
    price: 3290,
    floor: '4th of 4',
    year: 1899,
    distance: '1.2 km from HB',
    available: '1 June 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    ],
    features: ['Balcony', 'Dishwasher', 'Laundry in flat', 'Pets ok'],
    note:
      'Original 1899 stucco, herringbone parquet, and ceilings tall enough you actually notice them. Top floor, no neighbours above.',
    coords: '47.3839,8.5497',
  },
  {
    id: 'l5',
    title: 'Bright 2-room near Idaplatz',
    neighborhood: 'Wiedikon',
    street: 'Bertastrasse 14',
    rooms: 2,
    sqm: 56,
    price: 2150,
    floor: '2nd of 3',
    year: 1932,
    distance: '2.6 km from HB',
    available: '1 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=1200&q=80',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80',
    ],
    features: ['Balcony', 'Pets ok', 'Laundry in building'],
    note:
      'Idaplatz is two minutes away — coffee, the cinema, the Saturday market. Flat itself is small but lives bigger than the floor plan suggests.',
    coords: '47.3692,8.5145',
  },
  {
    id: 'l6',
    title: 'Lakeside 2.5 with morning light',
    neighborhood: 'Seefeld',
    street: 'Seefeldstrasse 142',
    rooms: 2.5,
    sqm: 71,
    price: 3100,
    floor: '3rd of 5',
    year: 1965,
    distance: '2.1 km from HB',
    available: '15 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&q=80',
      'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1200&q=80',
    ],
    features: ['Balcony', 'Parking', 'Dishwasher', 'Elevator'],
    note:
      'East-facing — direct morning light, gentler in the afternoon. Tiefenbrunnen S-Bahn is six minutes on foot, lake the same.',
    coords: '47.3528,8.5567',
  },
  {
    id: 'l7',
    title: 'Renovated 4-room with home office',
    neighborhood: 'Oerlikon',
    street: 'Schaffhauserstrasse 411',
    rooms: 4,
    sqm: 108,
    price: 3390,
    floor: '5th of 8',
    year: 1989,
    distance: '4.8 km from HB',
    available: '1 June 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80',
      'https://images.unsplash.com/photo-1494203484021-3c454daf695d?w=1200&q=80',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
    ],
    features: ['Balcony', 'Parking', 'Dishwasher', 'Laundry in flat', 'Elevator'],
    note:
      'Renovated end of 2024. The fourth room is small enough to honestly call an office, big enough that a guest can sleep in it.',
    coords: '47.4115,8.5439',
  },
  {
    id: 'l8',
    title: 'Cosy 1.5 with reading nook',
    neighborhood: 'Kreis 5',
    street: 'Josefstrasse 162',
    rooms: 1.5,
    sqm: 38,
    price: 1820,
    floor: '2nd of 4',
    year: 1925,
    distance: '0.9 km from HB',
    available: '1 May 2026',
    duration: '12+ months',
    photos: [
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1200&q=80',
      'https://images.unsplash.com/photo-1618219740975-d40978ee0e23?w=1200&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909190-eccf4a8bf97a?w=1200&q=80',
    ],
    features: ['Furnished', 'Dishwasher', 'Pets ok'],
    note:
      'Tiny but the bay window is a whole room of its own. Walk to HB in ten, Langstrasse in five if you want company.',
    coords: '47.3855,8.5283',
  },
];

export const COVER_LETTER_DE = `Liebe Vermieterschaft,

mit grossem Interesse habe ich Ihr Inserat für die Wohnung an der Heinrichstrasse 230 entdeckt und bewerbe mich gerne dafür. Die ruhige Lage in Kreis 5, kombiniert mit der Nähe zum Letten und zur Innenstadt, entspricht genau dem, was ich seit längerem suche.

Ich arbeite seit 2022 als UX-Designerin bei einem Zürcher Tech-Unternehmen mit unbefristetem Vertrag und einem festen Bruttolohn. Meine letzte Wohnung in Wiedikon habe ich drei Jahre lang bewohnt — die Referenz meiner bisherigen Vermieterin lege ich der Bewerbung gerne bei.

Ich bin Nichtraucherin, ruhig, achtsam mit dem Wohnraum, und ich pflege gute Beziehungen zur Nachbarschaft. Haustiere habe ich keine. Den Mietzins kann ich problemlos tragen — er liegt deutlich unter einem Drittel meines Nettoeinkommens.

Sehr gerne stelle ich mich Ihnen bei einer Besichtigung persönlich vor und beantworte alle weiteren Fragen. Sie erreichen mich jederzeit per Telefon oder E-Mail.

Mit freundlichen Grüssen,
Lea Marti`;

const HOUR = 1000 * 60 * 60;

export const initialApplications = (): Application[] => [
  {
    id: 'a1',
    listingId: 'l2',
    status: 'pending_review',
    updatedAt: Date.now() - 1000 * 60 * 12,
    coverLetter: COVER_LETTER_DE,
  },
  { id: 'a2', listingId: 'l5', status: 'applied', updatedAt: Date.now() - HOUR * 6 },
  {
    id: 'a3',
    listingId: 'l6',
    status: 'visit_booked',
    updatedAt: Date.now() - HOUR * 26,
    visitDate: 'Wed 6 May, 18:30',
  },
  { id: 'a4', listingId: 'l1', status: 'accepted', updatedAt: Date.now() - HOUR * 72 },
];

export const NEIGHBORHOODS = [
  'Kreis 1',
  'Kreis 2',
  'Kreis 3',
  'Kreis 4',
  'Kreis 5',
  'Kreis 6',
  'Kreis 7',
  'Kreis 8',
  'Kreis 9',
  'Kreis 10',
  'Kreis 11',
  'Oerlikon',
  'Wiedikon',
  'Seefeld',
  'Enge',
  'Wipkingen',
];

export const NATIONALITIES = [
  'Switzerland',
  'Germany',
  'Austria',
  'Italy',
  'France',
  'United Kingdom',
  'United States',
  'Spain',
  'Portugal',
  'Netherlands',
  'Sweden',
  'Other',
];

export const DEFAULT_PROFILE: Profile = {
  firstName: 'Lea',
  lastName: 'Marti',
  birthday: '1994-07-14',
  nationality: 'Switzerland',
  email: 'lea.marti@hey.com',
  phone: '+41 78 412 09 33',
  bio: "UX designer, longtime Wiedikon resident, slow cook, fast cyclist. Quiet weekday evenings, friends over on weekends. Looking for somewhere I can stay for years.",
  documents: {
    cv: { name: 'Lea_Marti_CV_2026.pdf', uploaded: true },
    debt: { name: 'Betreibungsauszug_April2026.pdf', uploaded: true },
    salary: { name: null, uploaded: false },
  },
  landlords: [
    { name: 'M. Keller', contact: 'm.keller@hausverwaltung-zh.ch', from: '2022-03', to: 'present' },
  ],
  preferences: {
    maxRent: 2800,
    minRooms: 2,
    minSqm: 50,
    neighborhoods: ['Kreis 4', 'Kreis 5', 'Wiedikon'],
    balcony: true,
    parking: false,
    petFriendly: false,
    furnished: 'Any',
  },
};
