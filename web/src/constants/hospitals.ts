export interface Hospital {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "wellness";
  specialization: string[];
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  emergency: boolean;
  open24h: boolean;
  hours: string;
  lat: number;
  lng: number;
  avatar: string;
}

export const HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "NIMHANS (National Institute of Mental Health)",
    type: "hospital",
    specialization: ["Psychiatry", "Psychology", "Neurology"],
    address: "Hosur Rd, Lakkasandra, Wilson Garden, Bengaluru",
    phone: "+91-80-46110007",
    website: "https://nimhans.ac.in",
    rating: 4.7,
    reviews: 312,
    emergency: true,
    open24h: true,
    hours: "24/7 Emergency",
    lat: 12.9352,
    lng: 77.5958,
    avatar: "NI",
  },
  {
    id: "h2",
    name: "Vandrevala Foundation Helpline",
    type: "clinic",
    specialization: ["Crisis Support", "Depression", "Anxiety"],
    address: "Online & Nationwide, India",
    phone: "1860-2662-345",
    website: "https://www.vandrevalafoundation.com",
    rating: 4.9,
    reviews: 540,
    emergency: true,
    open24h: true,
    hours: "24/7",
    lat: 19.076,
    lng: 72.8777,
    avatar: "VF",
  },
  {
    id: "h3",
    name: "iCall Psychosocial Helpline",
    type: "clinic",
    specialization: ["Counselling", "Stress", "Anxiety", "Depression"],
    address: "TISS, Mumbai",
    phone: "9152987821",
    website: "https://icallhelpline.org",
    rating: 4.8,
    reviews: 280,
    emergency: false,
    open24h: false,
    hours: "Mon–Sat 8 AM–10 PM",
    lat: 19.0456,
    lng: 72.8819,
    avatar: "IC",
  },
  {
    id: "h4",
    name: "Fortis Mental Health",
    type: "hospital",
    specialization: ["Psychiatry", "De-addiction", "Bipolar Disorder"],
    address: "Cunningham Road, Bangalore",
    phone: "+91-124-4921021",
    website: "https://www.fortishealthcare.com",
    rating: 4.6,
    reviews: 189,
    emergency: true,
    open24h: true,
    hours: "24/7 Emergency",
    lat: 12.9847,
    lng: 77.5896,
    avatar: "FH",
  },
  {
    id: "h5",
    name: "Mpower — Centre for Mental Health",
    type: "wellness",
    specialization: ["Counselling", "OCD", "PTSD", "Stress Management"],
    address: "Dadar, Mumbai",
    phone: "1800-120-820050",
    website: "https://mpowerminds.com",
    rating: 4.8,
    reviews: 210,
    emergency: false,
    open24h: false,
    hours: "Mon–Sat 9 AM–7 PM",
    lat: 19.0195,
    lng: 72.8438,
    avatar: "MP",
  },
  {
    id: "h6",
    name: "Asha Counselling Centre",
    type: "clinic",
    specialization: ["Depression", "Family Therapy", "Grief"],
    address: "South Delhi",
    phone: "+91-11-47538888",
    website: "https://www.ashacounselling.org",
    rating: 4.7,
    reviews: 156,
    emergency: false,
    open24h: false,
    hours: "Mon–Fri 9 AM–6 PM",
    lat: 28.5498,
    lng: 77.205,
    avatar: "AC",
  },
];

// Simulated distance offsets for facility placement around user location
const OFFSETS = [
  { dlat: 0.01, dlng: 0.02, base: 2.1, extra: 0.6 },
  { dlat: -0.03, dlng: 0.04, base: 4.5, extra: 0.8 },
  { dlat: 0.06, dlng: -0.03, base: 7.2, extra: 0.5 },
  { dlat: -0.05, dlng: 0.05, base: 6.8, extra: 1.0 },
  { dlat: 0.09, dlng: 0.07, base: 11.4, extra: 0.7 },
  { dlat: -0.07, dlng: -0.04, base: 9.3, extra: 0.4 },
];

export interface HospitalWithDistance extends Hospital {
  distance: number;
  simLat: number;
  simLng: number;
}

export function assignHospitalDistances(
  lat: number,
  lng: number
): HospitalWithDistance[] {
  return HOSPITALS.map((h, i) => {
    const offset = OFFSETS[i % OFFSETS.length];
    return {
      ...h,
      distance: parseFloat((offset.base + offset.extra).toFixed(1)),
      simLat: lat + offset.dlat,
      simLng: lng + offset.dlng,
    };
  }).sort((a, b) => a.distance - b.distance);
}
