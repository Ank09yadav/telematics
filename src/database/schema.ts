import { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(db: SQLiteDatabase) {
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create trips table (for tracking drive aggregates)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      distance REAL NOT NULL,
      avg_speed REAL NOT NULL,
      max_speed REAL NOT NULL,
      score REAL NOT NULL,
      harsh_accel_count INTEGER NOT NULL,
      harsh_brake_count INTEGER NOT NULL,
      harsh_corner_count INTEGER NOT NULL,
      gps_points TEXT NOT NULL
    );
  `);

  // Create events table (linked to trips)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      magnitude REAL NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
    );
  `);

  // Create alerts table (for the unified SafeGuard Alerts screen feed)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      latitude REAL,
      longitude REAL
    );
  `);

  // Create contacts table (for emergency contacts)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);

  // Create profile table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      blood_group TEXT,
      vehicle_no TEXT
    );
  `);

  // Check if we need to migrate/re-seed from old US default contacts to Indian emergency contacts
  const firstContact = await db.getFirstAsync<{ name: string }>('SELECT name FROM contacts ORDER BY id ASC LIMIT 1;');
  if (firstContact && firstContact.name === 'Roadside Assistance') {
    // Clear old default contacts
    await db.runAsync('DELETE FROM contacts;');
  }

  // Seed default contacts if empty
  const contactCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM contacts;');
  if (contactCount && contactCount.count === 0) {
    await db.runAsync("INSERT INTO contacts (name, phone, type) VALUES ('National Emergency Number', '112', 'emergency');");
    await db.runAsync("INSERT INTO contacts (name, phone, type) VALUES ('Medical Emergency (Ambulance)', '108', 'emergency');");
    await db.runAsync("INSERT INTO contacts (name, phone, type) VALUES ('National Highway Helpline', '1033', 'dispatch');");
  }

  // Seed default profile if empty
  const profileCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM profile;');
  if (profileCount && profileCount.count === 0) {
    await db.runAsync(
      "INSERT INTO profile (name, email, phone, blood_group, vehicle_no) VALUES ('David Carter', 'david.carter@safeguard.io', '+91 98765 43210', 'O+', 'DL-3C-AB-1234');"
    );
  }
}
