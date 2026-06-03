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
}
