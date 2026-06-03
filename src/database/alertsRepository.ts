import { SQLiteDatabase } from 'expo-sqlite';

export interface SafetyAlert {
  id?: number;
  timestamp: number;
  type: 'sudden_impact' | 'speed_warning' | 'sound_alert' | 'sos' | 'gps_signal' | 'low_battery';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved';
  latitude?: number;
  longitude?: number;
}

export class AlertsRepository {
  public static async saveAlert(db: SQLiteDatabase, alert: SafetyAlert): Promise<number> {
    const result = await db.runAsync(
      `INSERT INTO alerts (timestamp, type, title, description, severity, status, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.timestamp,
        alert.type,
        alert.title,
        alert.description,
        alert.severity,
        alert.status,
        alert.latitude || null,
        alert.longitude || null,
      ]
    );
    return result.lastInsertRowId;
  }

  public static async getAlerts(db: SQLiteDatabase): Promise<SafetyAlert[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM alerts ORDER BY timestamp DESC');
    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      latitude: row.latitude || undefined,
      longitude: row.longitude || undefined,
    }));
  }

  public static async resolveAlert(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync("UPDATE alerts SET status = 'resolved' WHERE id = ?", [id]);
  }

  public static async deleteAlert(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
  }

  public static async clearAll(db: SQLiteDatabase): Promise<void> {
    await db.runAsync('DELETE FROM alerts');
  }
}
