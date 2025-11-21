import { Phone, Glass } from '../types';
import { db } from './firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';

// Initial Mock Data (używane tylko przy pierwszym uruchomieniu, jeśli baza jest pusta)
const INITIAL_PHONES: Phone[] = [
  { id: 1, brand: 'Apple', model: 'iPhone 14 Pro', height_mm: 147.5, width_mm: 71.5, release_year: 2022 },
  { id: 2, brand: 'Samsung', model: 'Galaxy S23', height_mm: 146.3, width_mm: 70.9, release_year: 2023 },
  { id: 3, brand: 'Google', model: 'Pixel 7', height_mm: 155.6, width_mm: 73.2, release_year: 2022 },
];

const INITIAL_GLASSES: Glass[] = [
  { id: 1, sku: 'GL-IP14P', height_mm: 146.5, width_mm: 70.5, notes: 'Standard clear glass' },
  { id: 2, sku: 'GL-UNIV-S', height_mm: 145.0, width_mm: 70.0, notes: 'Universal Small' },
  { id: 3, sku: 'GL-S23-PRIV', height_mm: 145.8, width_mm: 70.4, notes: 'Privacy filter' },
];

class InventoryService {
  private phonesCollection = collection(db, 'phones');
  private glassesCollection = collection(db, 'glasses');

  // Inicjalizacja danych początkowych (tylko jeśli baza jest pusta)
  private async initializeIfEmpty() {
    const phonesSnapshot = await getDocs(this.phonesCollection);
    const glassesSnapshot = await getDocs(this.glassesCollection);

    if (phonesSnapshot.empty) {
      // Dodaj początkowe telefony
      for (const phone of INITIAL_PHONES) {
        await addDoc(this.phonesCollection, phone);
      }
    }

    if (glassesSnapshot.empty) {
      // Dodaj początkowe folie
      for (const glass of INITIAL_GLASSES) {
        await addDoc(this.glassesCollection, glass);
      }
    }
  }

  async getPhones(): Promise<Phone[]> {
    try {
      await this.initializeIfEmpty();
      const snapshot = await getDocs(query(this.phonesCollection, orderBy('id')));
      return snapshot.docs.map(doc => ({ id: doc.data().id, ...doc.data() } as Phone));
    } catch (error) {
      console.error('Błąd podczas pobierania telefonów:', error);
      throw error;
    }
  }

  async getGlasses(): Promise<Glass[]> {
    try {
      await this.initializeIfEmpty();
      const snapshot = await getDocs(query(this.glassesCollection, orderBy('id')));
      return snapshot.docs.map(doc => ({ id: doc.data().id, ...doc.data() } as Glass));
    } catch (error) {
      console.error('Błąd podczas pobierania folii:', error);
      throw error;
    }
  }

  async addGlass(glass: Omit<Glass, 'id'>): Promise<Glass> {
    try {
      // Pobierz wszystkie folie aby wygenerować nowe ID
      const glasses = await this.getGlasses();
      const newId = glasses.length > 0 ? Math.max(...glasses.map(g => g.id)) + 1 : 1;
      const newGlass = { ...glass, id: newId };
      
      await addDoc(this.glassesCollection, newGlass);
      return newGlass;
    } catch (error) {
      console.error('Błąd podczas dodawania folii:', error);
      throw error;
    }
  }

  async updateGlass(id: number, updates: Partial<Glass>): Promise<Glass> {
    try {
      // Znajdź dokument po ID
      const snapshot = await getDocs(this.glassesCollection);
      const glassDoc = snapshot.docs.find(doc => doc.data().id === id);
      
      if (!glassDoc) {
        throw new Error('Glass not found');
      }

      const updatedGlass = { ...glassDoc.data(), ...updates } as Glass;
      await updateDoc(doc(this.glassesCollection, glassDoc.id), updates);
      
      return updatedGlass;
    } catch (error) {
      console.error('Błąd podczas aktualizacji folii:', error);
      throw error;
    }
  }

  async deleteGlass(id: number): Promise<void> {
    try {
      // Znajdź dokument po ID
      const snapshot = await getDocs(this.glassesCollection);
      const glassDoc = snapshot.docs.find(doc => doc.data().id === id);
      
      if (!glassDoc) {
        throw new Error('Glass not found');
      }

      await deleteDoc(doc(this.glassesCollection, glassDoc.id));
    } catch (error) {
      console.error('Błąd podczas usuwania folii:', error);
      throw error;
    }
  }

  async addPhone(phone: Omit<Phone, 'id'>): Promise<Phone> {
    try {
      // Pobierz wszystkie telefony aby wygenerować nowe ID
      const phones = await this.getPhones();
      const newId = phones.length > 0 ? Math.max(...phones.map(p => p.id)) + 1 : 1;
      const newPhone = { ...phone, id: newId };
      
      await addDoc(this.phonesCollection, newPhone);
      return newPhone;
    } catch (error) {
      console.error('Błąd podczas dodawania telefonu:', error);
      throw error;
    }
  }

  async updatePhone(id: number, updates: Partial<Phone>): Promise<Phone> {
    try {
      // Znajdź dokument po ID
      const snapshot = await getDocs(this.phonesCollection);
      const phoneDoc = snapshot.docs.find(doc => doc.data().id === id);
      
      if (!phoneDoc) {
        throw new Error('Phone not found');
      }

      const updatedPhone = { ...phoneDoc.data(), ...updates } as Phone;
      await updateDoc(doc(this.phonesCollection, phoneDoc.id), updates);
      
      return updatedPhone;
    } catch (error) {
      console.error('Błąd podczas aktualizacji telefonu:', error);
      throw error;
    }
  }

  async deletePhone(id: number): Promise<void> {
    try {
      // Znajdź dokument po ID
      const snapshot = await getDocs(this.phonesCollection);
      const phoneDoc = snapshot.docs.find(doc => doc.data().id === id);
      
      if (!phoneDoc) {
        throw new Error('Phone not found');
      }

      await deleteDoc(doc(this.phonesCollection, phoneDoc.id));
    } catch (error) {
      console.error('Błąd podczas usuwania telefonu:', error);
      throw error;
    }
  }

  async bulkImportPhones(phones: Phone[]): Promise<void> {
    try {
      // Pobierz aktualne telefony
      const currentPhones = await this.getPhones();
      const phoneMap = new Map(currentPhones.map(p => [p.model, p]));

      // Przygotuj mapę zaktualizowanych telefonów
      phones.forEach(p => {
        const existing = phoneMap.get(p.model);
        if (existing) {
          phoneMap.set(p.model, { ...existing, ...p, id: existing.id });
        } else {
          const newId = currentPhones.length > 0 
            ? Math.max(...currentPhones.map(x => x.id)) + 1 
            : 1;
          phoneMap.set(p.model, { ...p, id: newId });
        }
      });

      // Zaktualizuj wszystkie telefony w Firestore
      const snapshot = await getDocs(this.phonesCollection);
      const batch: Promise<void>[] = [];

      // Usuń wszystkie istniejące
      snapshot.docs.forEach(doc => {
        batch.push(deleteDoc(doc.ref));
      });

      // Dodaj zaktualizowane
      const updatedPhones = Array.from(phoneMap.values());
      updatedPhones.forEach(phone => {
        batch.push(addDoc(this.phonesCollection, phone).then(() => {}));
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Błąd podczas importu telefonów:', error);
      throw error;
    }
  }

  // Helper to reset DB for testing
  async reset() {
    try {
      // Usuń wszystkie telefony
      const phonesSnapshot = await getDocs(this.phonesCollection);
      phonesSnapshot.docs.forEach(doc => deleteDoc(doc.ref));

      // Usuń wszystkie folie
      const glassesSnapshot = await getDocs(this.glassesCollection);
      glassesSnapshot.docs.forEach(doc => deleteDoc(doc.ref));

      // Dodaj początkowe dane
      await this.initializeIfEmpty();
    } catch (error) {
      console.error('Błąd podczas resetowania bazy:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
