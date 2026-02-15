// electron/database.js
/**
 * SQLite Database Manager
 * Provides unlimited storage using desktop hard disk
 * 
 * Features:
 * - Unlimited storage (limited only by hard disk)
 * - Full SQL database with indexes
 * - Automatic backups
 * - Data export/import
 * - Performance optimization
 * - Transaction support
 * 
 * Version: 3.0
 * Developer: MWA
 * 
 * NOTE: Using better-sqlite3 (synchronous, no compilation issues on CI/CD)
 */

const Database_sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database and create tables
   */
  async initialize() {
    try {
      this.db = new Database_sqlite(this.dbPath);

      console.log('✅ Connected to SQLite database');

      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');

      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');

      // Create tables
      await this.createTables();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create all necessary tables
   */
  async createTables() {
    const tables = [
      // Key-value store for app settings
      `CREATE TABLE IF NOT EXISTS app_data (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        size INTEGER NOT NULL
      )`,

      // Students table
      `CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        admission_number TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        date_of_birth TEXT,
        gender TEXT NOT NULL,
        father_name TEXT NOT NULL,
        father_phone TEXT,
        father_email TEXT,
        mother_name TEXT,
        mother_phone TEXT,
        class_id INTEGER NOT NULL,
        section_id INTEGER,
        admission_date TEXT NOT NULL,
        monthly_fee REAL NOT NULL,
        transport_opted INTEGER DEFAULT 0,
        transport_fee REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Teachers table
      `CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        designation TEXT NOT NULL,
        salary REAL NOT NULL,
        joining_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,

      // Fee records table
      `CREATE TABLE IF NOT EXISTS fee_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_number TEXT UNIQUE NOT NULL,
        student_id INTEGER NOT NULL,
        fee_month INTEGER NOT NULL,
        fee_year INTEGER NOT NULL,
        total_fee REAL NOT NULL,
        late_fee REAL DEFAULT 0,
        concession_amount REAL DEFAULT 0,
        amount_paid REAL NOT NULL,
        balance_due REAL DEFAULT 0,
        payment_date TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )`,

      // Salary payments table
      `CREATE TABLE IF NOT EXISTS salary_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id TEXT UNIQUE NOT NULL,
        teacher_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        basic_salary REAL NOT NULL,
        allowances REAL DEFAULT 0,
        deductions REAL DEFAULT 0,
        net_salary REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )`,

      // Audit logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        user_id INTEGER,
        user_name TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        created_at INTEGER NOT NULL
      )`
    ];

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_students_id ON students(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id)',
      'CREATE INDEX IF NOT EXISTS idx_students_status ON students(status)',
      'CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name)',
      'CREATE INDEX IF NOT EXISTS idx_teachers_id ON teachers(teacher_id)',
      'CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status)',
      'CREATE INDEX IF NOT EXISTS idx_fee_records_student ON fee_records(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_fee_records_date ON fee_records(payment_date)',
      'CREATE INDEX IF NOT EXISTS idx_fee_records_month_year ON fee_records(fee_month, fee_year)',
      'CREATE INDEX IF NOT EXISTS idx_fee_records_receipt ON fee_records(receipt_number)',
      'CREATE INDEX IF NOT EXISTS idx_salary_payments_teacher ON salary_payments(teacher_id)',
      'CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON salary_payments(payment_date)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id)'
    ];

    // better-sqlite3 is synchronous — run all at once
    const runAll = this.db.transaction(() => {
      tables.forEach((sql) => {
        try {
          this.db.prepare(sql).run();
        } catch (err) {
          console.error('Error creating table:', err);
        }
      });
      indexes.forEach((sql) => {
        try {
          this.db.prepare(sql).run();
        } catch (err) {
          console.error('Error creating index:', err);
        }
      });
    });

    runAll();
  }

  /**
   * Get item from app_data table
   */
  async get(key, defaultValue) {
    try {
      const row = this.db.prepare('SELECT value FROM app_data WHERE key = ?').get(key);
      if (!row) return defaultValue;
      try {
        return JSON.parse(row.value);
      } catch (e) {
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  }

  /**
   * Set item in app_data table
   */
  async set(key, value) {
    const jsonValue = JSON.stringify(value);
    const size = Buffer.byteLength(jsonValue);
    const now = Date.now();

    this.db.prepare(
      `INSERT OR REPLACE INTO app_data (key, value, created_at, updated_at, size) 
       VALUES (?, ?, COALESCE((SELECT created_at FROM app_data WHERE key = ?), ?), ?, ?)`
    ).run(key, jsonValue, key, now, now, size);
  }

  /**
   * Remove item from app_data table
   */
  async remove(key) {
    this.db.prepare('DELETE FROM app_data WHERE key = ?').run(key);
  }

  /**
   * Execute SQL query (SELECT)
   */
  async query(sql, params = []) {
    try {
      return this.db.prepare(sql).all(params);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Execute SQL command (INSERT, UPDATE, DELETE)
   */
  async run(sql, params = []) {
    try {
      const result = this.db.prepare(sql).run(params);
      return { lastID: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get storage information
   */
  async getStorageInfo() {
    try {
      // Get database file size
      const stats = await stat(this.dbPath);
      const dbSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      // Get free disk space
      const diskSpace = require('check-disk-space').default;
      const space = await diskSpace(path.dirname(this.dbPath));
      const freeSpaceGB = (space.free / (1024 * 1024 * 1024)).toFixed(2);

      // Get record counts
      const students = this.db.prepare('SELECT COUNT(*) as count FROM students').get().count;
      const teachers = this.db.prepare('SELECT COUNT(*) as count FROM teachers').get().count;
      const feeRecords = this.db.prepare('SELECT COUNT(*) as count FROM fee_records').get().count;
      const salaryRecords = this.db.prepare('SELECT COUNT(*) as count FROM salary_payments').get().count;
      const appData = this.db.prepare('SELECT COUNT(*) as count FROM app_data').get().count;

      return {
        dbSizeMB,
        freeSpaceGB,
        totalRecords: students + teachers + feeRecords + salaryRecords,
        students,
        teachers,
        feeRecords,
        salaryRecords,
        appData,
        unlimited: true,
        dbPath: this.dbPath
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        dbSizeMB: '0',
        freeSpaceGB: '0',
        totalRecords: 0,
        students: 0,
        teachers: 0,
        feeRecords: 0,
        salaryRecords: 0,
        appData: 0,
        unlimited: true,
        error: error.message
      };
    }
  }

  /**
   * Create backup of database
   */
  async createBackup(directory) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `SchoolFeeManager_Backup_${timestamp}.db`;
      const backupPath = path.join(directory, filename);

      // better-sqlite3 has a built-in backup method
      await this.db.backup(backupPath);

      // Get backup file size
      const stats = await stat(backupPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Backup created: ${backupPath} (${sizeMB}MB)`);

      return {
        success: true,
        filepath: backupPath,
        filename: filename,
        sizeMB: sizeMB,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupPath) {
    try {
      // Verify backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      // Create safety backup of current database
      const safetyBackup = `${this.dbPath}.before-restore`;
      await copyFile(this.dbPath, safetyBackup);

      // Close current connection
      await this.close();

      // Copy backup to database path
      await copyFile(backupPath, this.dbPath);

      // Reopen database
      await this.initialize();

      console.log(`✅ Database restored from: ${backupPath}`);

      return {
        success: true,
        message: 'Database restored successfully',
        safetyBackup: safetyBackup
      };
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  /**
   * Export all data to JSON
   */
  async exportToJSON() {
    try {
      const data = {
        version: '3.0.0',
        exportDate: new Date().toISOString(),
        storageType: 'SQLite',
        appData: {},
        students: [],
        teachers: [],
        feeRecords: [],
        salaryPayments: []
      };

      // Export app_data
      const appDataRows = this.db.prepare('SELECT key, value FROM app_data').all();
      appDataRows.forEach(row => {
        try {
          data.appData[row.key] = JSON.parse(row.value);
        } catch (e) {
          data.appData[row.key] = row.value;
        }
      });

      // Export students
      const students = this.db.prepare('SELECT data FROM students').all();
      data.students = students.map(row => JSON.parse(row.data));

      // Export teachers
      const teachers = this.db.prepare('SELECT data FROM teachers').all();
      data.teachers = teachers.map(row => JSON.parse(row.data));

      // Export fee records
      const feeRecords = this.db.prepare('SELECT data FROM fee_records').all();
      data.feeRecords = feeRecords.map(row => JSON.parse(row.data));

      // Export salary payments
      const salaryPayments = this.db.prepare('SELECT data FROM salary_payments').all();
      data.salaryPayments = salaryPayments.map(row => JSON.parse(row.data));

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import data from JSON
   */
  async importFromJSON(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (!data.version || !data.exportDate) {
        throw new Error('Invalid import format');
      }

      // Use a transaction for atomicity
      const importTransaction = this.db.transaction(() => {
        // Import app_data
        if (data.appData) {
          for (const [key, value] of Object.entries(data.appData)) {
            const jsonValue = JSON.stringify(value);
            const size = Buffer.byteLength(jsonValue);
            const now = Date.now();
            this.db.prepare(
              `INSERT OR REPLACE INTO app_data (key, value, created_at, updated_at, size) 
               VALUES (?, ?, COALESCE((SELECT created_at FROM app_data WHERE key = ?), ?), ?, ?)`
            ).run(key, jsonValue, key, now, now, size);
          }
        }
      });

      importTransaction();

      console.log('✅ Data imported successfully');

      return {
        success: true,
        message: 'Data imported successfully'
      };
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Vacuum database to reclaim space
   */
  async vacuum() {
    this.db.prepare('VACUUM').run();
    console.log('✅ Database vacuumed');
  }

  /**
   * Optimize database
   */
  async optimize() {
    this.db.prepare('ANALYZE').run();
    console.log('✅ Database analyzed');
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Database connection closed');
    }
  }
}

module.exports = Database;
