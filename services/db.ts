import { Phone, Glass } from '../types';

// Initial Mock Data
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

// Simulating API Latency
const DELAY = 300;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  private getPhonesFromStorage(): Phone[] {
    const stored = localStorage.getItem('phones');
    return stored ? JSON.parse(stored) : INITIAL_PHONES;
  }

  private getGlassesFromStorage(): Glass[] {
    const stored = localStorage.getItem('glasses');
    return stored ? JSON.parse(stored) : INITIAL_GLASSES;
  }

  private savePhones(phones: Phone[]) {
    localStorage.setItem('phones', JSON.stringify(phones));
  }

  private saveGlasses(glasses: Glass[]) {
    localStorage.setItem('glasses', JSON.stringify(glasses));
  }

  async getPhones(): Promise<Phone[]> {
    await delay(DELAY);
    return this.getPhonesFromStorage();
  }

  async getGlasses(): Promise<Glass[]> {
    await delay(DELAY);
    return this.getGlassesFromStorage();
  }

  async addGlass(glass: Omit<Glass, 'id'>): Promise<Glass> {
    await delay(DELAY);
    const glasses = this.getGlassesFromStorage();
    const newId = glasses.length > 0 ? Math.max(...glasses.map(g => g.id)) + 1 : 1;
    const newGlass = { ...glass, id: newId };
    this.saveGlasses([...glasses, newGlass]);
    return newGlass;
  }

  async updateGlass(id: number, updates: Partial<Glass>): Promise<Glass> {
    await delay(DELAY);
    const glasses = this.getGlassesFromStorage();
    const index = glasses.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Glass not found');
    
    const updatedGlass = { ...glasses[index], ...updates };
    glasses[index] = updatedGlass;
    this.saveGlasses(glasses);
    return updatedGlass;
  }

  async deleteGlass(id: number): Promise<void> {
    await delay(DELAY);
    const glasses = this.getGlassesFromStorage();
    this.saveGlasses(glasses.filter(g => g.id !== id));
  }

  async bulkImportPhones(phones: Phone[]): Promise<void> {
    await delay(DELAY * 2);
    // Merge logic: update if model exists, add if new
    const currentPhones = this.getPhonesFromStorage();
    const phoneMap = new Map(currentPhones.map(p => [p.model, p]));

    phones.forEach(p => {
        // If ID is not provided in CSV, generate one or overwrite existing model
        const existing = phoneMap.get(p.model);
        if (existing) {
            phoneMap.set(p.model, { ...existing, ...p, id: existing.id });
        } else {
            const newId = Math.max(0, ...Array.from(phoneMap.values()).map(x => x.id)) + 1;
            phoneMap.set(p.model, { ...p, id: newId });
        }
    });

    this.savePhones(Array.from(phoneMap.values()));
  }

  // Helper to reset DB for testing
  reset() {
    this.savePhones(INITIAL_PHONES);
    this.saveGlasses(INITIAL_GLASSES);
  }
}

export const inventoryService = new InventoryService();
