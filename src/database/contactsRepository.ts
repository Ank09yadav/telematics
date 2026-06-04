import { SQLiteDatabase } from 'expo-sqlite';

export interface Contact {
  id?: number;
  name: string;
  phone: string;
  type: 'dispatch' | 'emergency' | 'contact';
}

export class ContactsRepository {
  /**
   * Retrieves all emergency contacts, sorted by ID ascending
   */
  public static async getContacts(db: SQLiteDatabase): Promise<Contact[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM contacts ORDER BY id ASC');
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      type: row.type,
    }));
  }

  /**
   * Saves a new contact to the contacts table
   */
  public static async saveContact(db: SQLiteDatabase, contact: Omit<Contact, 'id'>): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO contacts (name, phone, type) VALUES (?, ?, ?)',
      [contact.name, contact.phone, contact.type]
    );
    return result.lastInsertRowId;
  }

  /**
   * Deletes a contact by ID from the contacts table
   */
  public static async deleteContact(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
  }
}
