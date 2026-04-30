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
