import { SQLiteDatabase } from 'expo-sqlite';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  vehicleNo: string;
}

export class ProfileRepository {
  /**
   * Retrieves the user profile from the database
   */
  public static async getProfile(db: SQLiteDatabase): Promise<UserProfile> {
    const row = await db.getFirstAsync<any>('SELECT * FROM profile ORDER BY id ASC LIMIT 1');
    if (!row) {
      return {
        name: 'David Carter',
        email: 'david.carter@safeguard.io',
        phone: '+91 98765 43210',
        bloodGroup: 'O+',
        vehicleNo: 'DL-3C-AB-1234',
      };
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      bloodGroup: row.blood_group || '',
      vehicleNo: row.vehicle_no || '',
    };
  }

  /**
   * Updates the user profile in the database
   */
  public static async updateProfile(db: SQLiteDatabase, profile: UserProfile): Promise<void> {
    const existing = await db.getFirstAsync<any>('SELECT id FROM profile ORDER BY id ASC LIMIT 1');
    if (existing) {
      await db.runAsync(
        'UPDATE profile SET name = ?, email = ?, phone = ?, blood_group = ?, vehicle_no = ? WHERE id = ?',
        [profile.name, profile.email, profile.phone, profile.bloodGroup, profile.vehicleNo, existing.id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO profile (name, email, phone, blood_group, vehicle_no) VALUES (?, ?, ?, ?, ?)',
        [profile.name, profile.email, profile.phone, profile.bloodGroup, profile.vehicleNo]
      );
    }
  }
}
