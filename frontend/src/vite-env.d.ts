/// <reference types="vite/client" />

declare module '../services/db' {
  export const dbService: {
    getAll: (storeName: string) => Promise<any[]>;
    get: (storeName: string, key: any) => Promise<any>;
    add: (storeName: string, item: any) => Promise<any>;
    put: (storeName: string, item: any) => Promise<any>;
    delete: (storeName: string, key: any) => Promise<any>;
    authenticateUser: (email: string, password: string) => Promise<any>;
  };
}
