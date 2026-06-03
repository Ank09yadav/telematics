import { SQLiteDatabase } from 'expo-sqlite';
import { Trip, TelemetryEvent } from '../types/telemetry';

export class DriveRepository {
  /**
   * Saves a completed trip and its associated events in a transaction
   */
  public static async saveTrip(db: SQLiteDatabase, trip: Trip): Promise<number> {
    let tripId = 0;

    await db.withTransactionAsync(async () => {
      // 1. Insert Trip Row
      const tripResult = await db.runAsync(
        `INSERT INTO trips (
          start_time, end_time, duration, distance, avg_speed, 
          max_speed, score, harsh_accel_count, harsh_brake_count, 
          harsh_corner_count, gps_points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip.startTime,
          trip.endTime,
          trip.duration,
          trip.distance,
          trip.avgSpeed,
          trip.maxSpeed,
          trip.score,
          trip.harshAccelCount,
          trip.harshBrakeCount,
          trip.harshCornerCount,
          JSON.stringify(trip.gpsPoints),
        ]
      );
      
      tripId = tripResult.lastInsertRowId;

      // 2. Insert Event Rows
      for (const event of trip.events) {
        await db.runAsync(
          `INSERT INTO events (
            trip_id, timestamp, type, latitude, longitude, magnitude, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            tripId,
            event.timestamp,
            event.type,
            event.latitude,
            event.longitude,
            event.magnitude,
            event.description,
          ]
        );
      }
    });

    return tripId;
  }

  /**
   * Retrieves all trips, sorted by start_time descending
   */
  public static async getTrips(db: SQLiteDatabase): Promise<Trip[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM trips ORDER BY start_time DESC');
    const trips: Trip[] = [];

    for (const row of rows) {
      // Fetch events for this specific trip
      const eventRows = await db.getAllAsync<any>(
        'SELECT * FROM events WHERE trip_id = ? ORDER BY timestamp ASC',
        [row.id]
      );

      trips.push({
        id: row.id,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        distance: row.distance,
        avgSpeed: row.avg_speed,
        maxSpeed: row.max_speed,
        score: row.score,
        harshAccelCount: row.harsh_accel_count,
        harshBrakeCount: row.harsh_brake_count,
        harshCornerCount: row.harsh_corner_count,
        gpsPoints: JSON.parse(row.gps_points || '[]'),
        events: eventRows.map((e) => ({
          id: e.id,
          tripId: e.trip_id,
          timestamp: e.timestamp,
          type: e.type,
          latitude: e.latitude,
          longitude: e.longitude,
          magnitude: e.magnitude,
          description: e.description,
        })),
      });
    }

    return trips;
  }

  /**
   * Retrieves a single trip by ID, including its events
   */
  public static async getTripById(db: SQLiteDatabase, id: number): Promise<Trip | null> {
    const row = await db.getFirstAsync<any>('SELECT * FROM trips WHERE id = ?', [id]);
    if (!row) return null;

    const eventRows = await db.getAllAsync<any>(
      'SELECT * FROM events WHERE trip_id = ? ORDER BY timestamp ASC',
      [id]
    );

    return {
      id: row.id,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      distance: row.distance,
      avgSpeed: row.avg_speed,
      maxSpeed: row.max_speed,
      score: row.score,
      harshAccelCount: row.harsh_accel_count,
      harshBrakeCount: row.harsh_brake_count,
      harshCornerCount: row.harsh_corner_count,
      gpsPoints: JSON.parse(row.gps_points || '[]'),
      events: eventRows.map((e) => ({
        id: e.id,
        tripId: e.trip_id,
        timestamp: e.timestamp,
        type: e.type,
        latitude: e.latitude,
        longitude: e.longitude,
        magnitude: e.magnitude,
        description: e.description,
      })),
    };
  }

  /**
   * Deletes a trip by ID (foreign keys CASCADE deletes events)
   */
  public static async deleteTrip(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
  }

  /**
   * Clears the entire database (trips and events)
   */
  public static async clearAll(db: SQLiteDatabase): Promise<void> {
    await db.runAsync('DELETE FROM trips');
  }
}
