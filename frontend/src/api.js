import { dbService } from './services/db';

// Mock API that redirects to local DB
const api = {
    get: async (url) => {
        if (url === '/crops/') {
            const data = await dbService.getAll('crops');
            return { data };
        }
        if (url === '/tasks/') {
            const data = await dbService.getAll('tasks');
            return { data };
        }
        if (url === '/inventory/') {
            const data = await dbService.getAll('inventory');
            return { data };
        }
        throw new Error('Not implemented');
    },

    post: async (url, data) => {
        if (url === '/auth/login') {
            // Handle login via dbService in authStore, but if called here:
            const user = await dbService.authenticateUser(data.username, data.password);
            return { data: { access_token: 'local-token', user } };
        }
        if (url === '/crops/') {
            const id = await dbService.add('crops', { ...data, created_at: new Date() });
            return { data: { id, ...data } };
        }
        throw new Error('Not implemented');
    }
};

export default api;
