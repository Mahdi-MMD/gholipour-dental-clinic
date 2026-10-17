export interface ReservationItem {
  id: string;
  listNumber?: number;
  patientName: string;
  phone: string;
  service: string;
  visitedBefore: 'yes' | 'no' | null;
  proposedDate: string;
  createdAt: string;
  formattedDate: string;
  isConfirmed: boolean;
  confirmedAt?: string | null;
  notes?: string;
}

export type ReservationFilter = 'all' | 'pending' | 'confirmed';
