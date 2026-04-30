export type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  street: string;
  rooms: number;
  sqm: number;
  price: number;
  floor: string;
  year: number;
  distance: string;
  available: string;
  duration: string;
  photos: string[];
  features: string[];
  note: string;
  coords: string;
};

export type ApplicationStatus =
  | 'pending_review'
  | 'applied'
  | 'visit_requested'
  | 'visit_booked'
  | 'accepted'
  | 'rejected';

export type Application = {
  id: string;
  listingId: string;
  status: ApplicationStatus;
  updatedAt: number;
  coverLetter?: string;
  visitDate?: string;
};

export type DocStatus = { name: string | null; uploaded: boolean };

export type Landlord = {
  name: string;
  contact: string;
  from: string;
  to: string;
};

export type Preferences = {
  maxRent: number;
  minRooms: number;
  minSqm: number;
  neighborhoods: string[];
  balcony: boolean;
  parking: boolean;
  petFriendly: boolean;
  furnished: 'Any' | 'Furnished' | 'Unfurnished';
};

export type Profile = {
  firstName: string;
  lastName: string;
  birthday: string;
  nationality: string;
  email: string;
  phone: string;
  bio: string;
  documents: { cv: DocStatus; debt: DocStatus; salary: DocStatus };
  landlords: Landlord[];
  preferences: Preferences;
};
