import fs from 'fs/promises';
import path from 'path';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDb } from './firebase';
import { ReservationItem } from '@/types/reservation';
import {
  toPersianDigits,
  toEnglishDigits,
  cleanPhoneForTel,
  formatToPersianDateTime,
} from './reservationFormatters';
import { normalize_and_validate_iran_phone } from './reservationValidators';
export { toPersianDigits, toEnglishDigits, cleanPhoneForTel, formatToPersianDateTime };

const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'reservations.json');

// Local JSON File Helpers
async function readLocalReservations(): Promise<ReservationItem[]> {
  try {
    const data = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalReservations(items: ReservationItem[]): Promise<void> {
  try {
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local reservations fallback:', err);
  }
}

// Fetch all reservations
export async function getAllReservations(): Promise<ReservationItem[]> {
  try {
    const db = getDb();
    const colRef = collection(db, 'reservations');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    // If getDocs executed without throwing, Firestore is the authoritative source
    const firestoreItems: ReservationItem[] = snapshot.docs.map((docSnap, index) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        listNumber: index + 1,
        patientName: data.patientName || '',
        phone: data.phone || '',
        service: data.service || '',
        visitedBefore: data.visitedBefore || null,
        proposedDate: data.proposedDate || '',
        createdAt: data.createdAt || new Date().toISOString(),
        formattedDate:
          data.formattedDate || formatToPersianDateTime(new Date(data.createdAt || Date.now())),
        isConfirmed: Boolean(data.isConfirmed),
        confirmedAt: data.confirmedAt || null,
        notes: data.notes || '',
      };
    });

    // Keep local cache in sync (even if empty, so deleted items do not resurrect)
    await writeLocalReservations(firestoreItems);
    return firestoreItems;
  } catch (err) {
    console.warn('Firestore fetch failed, falling back to local storage:', err);
    // Fallback to local storage only if Firestore is unreachable
    const localItems = await readLocalReservations();
    return localItems.map((item, idx) => ({
      ...item,
      listNumber: idx + 1,
    }));
  }
}

// Check if a normalized phone number has an active reservation within the last 24 hours
export async function hasActiveReservationInLast24Hours(rawPhone: string): Promise<boolean> {
  const phoneValidation = normalize_and_validate_iran_phone(rawPhone);
  const targetPhone = phoneValidation.isValid
    ? phoneValidation.normalizedPhone
    : rawPhone.replace(/\D/g, '');
  if (!targetPhone) return false;

  const all = await getAllReservations();
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  return all.some(item => {
    // Check normalized phone match
    const itemNorm = normalize_and_validate_iran_phone(item.phone);
    const itemDigits = itemNorm.isValid ? itemNorm.normalizedPhone : item.phone.replace(/\D/g, '');
    if (itemDigits !== targetPhone) return false;

    // Check created time within 24h
    const createdTime = new Date(item.createdAt).getTime();
    if (isNaN(createdTime)) return false;

    const diff = now - createdTime;
    return diff >= 0 && diff < TWENTY_FOUR_HOURS_MS;
  });
}

// Fetch a single reservation by ID
export async function getReservationById(id: string): Promise<ReservationItem | null> {
  if (!id) return null;

  // 1. Try Firestore
  try {
    const db = getDb();
    const docRef = doc(db, 'reservations', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        patientName: data.patientName || '',
        phone: data.phone || '',
        service: data.service || '',
        visitedBefore: data.visitedBefore || null,
        proposedDate: data.proposedDate || '',
        createdAt: data.createdAt || new Date().toISOString(),
        formattedDate:
          data.formattedDate || formatToPersianDateTime(new Date(data.createdAt || Date.now())),
        isConfirmed: Boolean(data.isConfirmed),
        confirmedAt: data.confirmedAt || null,
        notes: data.notes || '',
      };
    }
  } catch (err) {
    console.warn(`Firestore getDoc for ${id} failed:`, err);
  }

  // 2. Fallback to local store
  const localItems = await readLocalReservations();
  const item = localItems.find(r => r.id === id);
  return item || null;
}

// Add a new reservation
export async function addReservation(item: {
  patientName: string;
  phone: string;
  service: string;
  visitedBefore: 'yes' | 'no' | null;
  proposedDate: string;
  notes?: string;
}): Promise<ReservationItem> {
  const now = new Date();
  const createdAt = now.toISOString();
  const formattedDate = formatToPersianDateTime(now);

  const newReservationData = {
    patientName: item.patientName.trim(),
    phone: item.phone.trim(),
    service: item.service.trim(),
    visitedBefore: item.visitedBefore,
    proposedDate: item.proposedDate.trim(),
    createdAt,
    formattedDate,
    isConfirmed: false,
    confirmedAt: null,
    notes: item.notes?.trim() || '',
  };

  let createdId = `res-${Date.now()}`;

  // Attempt to write to Cloud Firestore
  try {
    const db = getDb();
    const colRef = collection(db, 'reservations');
    const docRef = await addDoc(colRef, newReservationData);
    createdId = docRef.id;
  } catch (err) {
    console.warn('Firestore save failed, saving to local store:', err);
  }

  const createdItem: ReservationItem = {
    id: createdId,
    listNumber: 1,
    ...newReservationData,
  };

  // Sync to local JSON file
  const localItems = await readLocalReservations();
  const updatedItems = [createdItem, ...localItems.filter(r => r.id !== createdId)];
  await writeLocalReservations(updatedItems);

  return createdItem;
}

// Update confirmation / review status
export async function updateReservationStatus(
  id: string,
  isConfirmed: boolean
): Promise<ReservationItem | null> {
  const confirmedAt = isConfirmed ? new Date().toISOString() : null;
  let updatedDoc: ReservationItem | null = null;

  // Try updating Firestore
  try {
    const db = getDb();
    const docRef = doc(db, 'reservations', id);
    await updateDoc(docRef, {
      isConfirmed,
      confirmedAt,
    });

    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      updatedDoc = {
        id: snap.id,
        patientName: data.patientName || '',
        phone: data.phone || '',
        service: data.service || '',
        visitedBefore: data.visitedBefore || null,
        proposedDate: data.proposedDate || '',
        createdAt: data.createdAt || new Date().toISOString(),
        formattedDate:
          data.formattedDate || formatToPersianDateTime(new Date(data.createdAt || Date.now())),
        isConfirmed: Boolean(data.isConfirmed),
        confirmedAt: data.confirmedAt || null,
        notes: data.notes || '',
      };
    }
  } catch (err) {
    console.warn(`Firestore update for ${id} failed:`, err);
  }

  // Update local file
  const localItems = await readLocalReservations();
  const index = localItems.findIndex(r => r.id === id);
  if (index >= 0) {
    localItems[index].isConfirmed = isConfirmed;
    localItems[index].confirmedAt = confirmedAt;
    await writeLocalReservations(localItems);
    return updatedDoc || localItems[index];
  } else if (updatedDoc) {
    localItems.unshift(updatedDoc);
    await writeLocalReservations(localItems);
    return updatedDoc;
  }

  return updatedDoc;
}

// Delete reservation
export async function deleteReservation(id: string): Promise<boolean> {
  let itemExisted = false;

  // Try Firestore
  try {
    const db = getDb();
    const docRef = doc(db, 'reservations', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      itemExisted = true;
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn(`Firestore delete for ${id} failed:`, err);
  }

  // Check and sync local file
  const localItems = await readLocalReservations();
  const filtered = localItems.filter(r => r.id !== id);
  if (filtered.length !== localItems.length) {
    itemExisted = true;
    await writeLocalReservations(filtered);
  }

  return itemExisted;
}
