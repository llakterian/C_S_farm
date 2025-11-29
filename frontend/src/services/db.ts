import Dexie from 'dexie';
import CryptoJS from 'crypto-js';
import type { User, Entity, Task, Report } from '../types/schema';

class FarmDB extends Dexie {
  users: Dexie.Table<User, string>;
  entities: Dexie.Table<Entity, string>;
  tasks: Dexie.Table<Task, string>;
  reports: Dexie.Table<Report, string>;

  constructor() {
    super('FarmDB');
    this.version(1).stores({
      users: 'id, email',
      entities: 'id, type, name',
      tasks: 'id, status, dueDate',
      reports: 'id, type, generatedAt'
    });
    this.users = this.table('users');
    this.entities = this.table('entities');
    this.tasks = this.table('tasks');
    this.reports = this.table('reports');
  }

  async encryptData(data: any): Promise<string> {
    const key = import.meta.env.VITE_ENCRYPT_KEY || 'default-key';
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  async decryptData(encrypted: string): Promise<any> {
    const key = import.meta.env.VITE_ENCRYPT_KEY || 'default-key';
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Auth methods
  async addUser(user: User) {
    const encryptedPin = await this.encryptData(user.pin);
    return this.users.add({ ...user, pin: encryptedPin });
  }

  async authenticateUser(email: string, pin: string): Promise<User | null> {
    const user = await this.users.get(email);
    if (user) {
      const decryptedPin = await this.decryptData(user.pin);
      if (decryptedPin === pin) return { ...user, pin: '' }; // Don't return pin
    }
    return null;
  }

  // CRUD for entities
  async addEntity(entity: Entity) {
    return this.entities.add(entity);
  }

  async getAllEntities(): Promise<Entity[]> {
    return this.entities.toArray();
  }

  // Tasks
  async addTask(task: Task) {
    return this.tasks.add(task);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasks.toArray();
  }

  // Reports
  async addReport(report: Report) {
    return this.reports.add(report);
  }

  async getAllReports(): Promise<Report[]> {
    return this.reports.toArray();
  }
}

export const db = new FarmDB();
