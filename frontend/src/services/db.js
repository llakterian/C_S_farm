import { openDB } from 'idb';

const DB_NAME = 'cs_farm_db_v6';
const DB_VERSION = 6;

const WORKERS_LIST = [
    'Victor', 'Chepnondiin', 'Linet', 'Dorcas', 'Vallery', 'Josphat', 'Caro', 'Pamela',
    'Faith', 'Kenneth', 'Peter', 'Kemunto', 'Nancy', 'Douglas', 'Judy Atieno', 'Cosmas',
    'Joan', 'Philip Langat', 'Samuel', 'Dorcas Nekesa', 'Vallery Namwasi', 'Josphat Kirui',
    'Caro Kwamboka', 'Pamela Akinyi', 'Faith Malel', 'Kenneth Kalya', 'Kemunto Judith',
    'Douglas Bosire', 'Cosmas Orina', 'Joan Rotich', 'Samuel Rotich', 'Daniel Kerongo',
    'Sheila', 'David', 'Henry', 'Juliana', 'Mary', 'Geoffrey', 'Rose', 'Johnstone', 'Titus', 'Yvonne'
];

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            // Users store (for auth)
            if (!db.objectStoreNames.contains('users')) {
                const usersStore = db.createObjectStore('users', { keyPath: 'email' });
                usersStore.createIndex('email', 'email', { unique: true });
            }

            // Factories store (Tea)
            if (!db.objectStoreNames.contains('factories')) {
                const factoryStore = db.createObjectStore('factories', { keyPath: 'id', autoIncrement: true });
                factoryStore.createIndex('name', 'name', { unique: true });

                // Seed default factories
                transaction.objectStore('factories').add({ name: 'Kaisugu Factory', rate: 22, transport: 3 });
                transaction.objectStore('factories').add({ name: 'Finlays Factory', rate: 27, transport: 3 });
                transaction.objectStore('factories').add({ name: 'Kuresoi Factory', rate: 23, transport: 3 });
                transaction.objectStore('factories').add({ name: 'Mbogo Valley', rate: 23, transport: 3 });
                transaction.objectStore('factories').add({ name: 'Unilever Factory', rate: 28, transport: 3 });
                transaction.objectStore('factories').add({ name: 'KTDA', rate: 26, transport: 3 });
            }

            // Workers store
            if (!db.objectStoreNames.contains('workers')) {
                const workersStore = db.createObjectStore('workers', { keyPath: 'id', autoIncrement: true });
                workersStore.createIndex('name', 'name');
                workersStore.createIndex('role', 'role');

                // Seed workers from Excel list
                WORKERS_LIST.forEach(name => {
                    let role = 'Plucker';
                    if (name === 'Victor') role = 'Supervisor';
                    if (name === 'Musa' || name.includes('Watchman')) role = 'Watchman';
                    workersStore.add({ name, role, phone: '', created_at: new Date() });
                });
            } else {
                // If store exists (upgrade path), check if we need to seed
                // We can't easily check count here without transaction blocking, 
                // so we'll rely on the seedSampleData function to be called explicitly
                // OR we can just add them here if we are sure.
                // Let's rely on seedSampleData being called on auth or manually.
            }

            // Tea Plucking Records
            if (!db.objectStoreNames.contains('tea_plucking')) {
                const pluckingStore = db.createObjectStore('tea_plucking', { keyPath: 'id', autoIncrement: true });
                pluckingStore.createIndex('worker_id', 'worker_id');
                pluckingStore.createIndex('date', 'date');
                pluckingStore.createIndex('factory_id', 'factory_id');
            }

            // Fertilizer Records
            if (!db.objectStoreNames.contains('fertilizer')) {
                const fertilizerStore = db.createObjectStore('fertilizer', { keyPath: 'id', autoIncrement: true });
                fertilizerStore.createIndex('worker_id', 'worker_id');
                fertilizerStore.createIndex('status', 'status');
            }

            // Dairy Production
            if (!db.objectStoreNames.contains('dairy_production')) {
                const dairyStore = db.createObjectStore('dairy_production', { keyPath: 'id', autoIncrement: true });
                dairyStore.createIndex('date', 'date');
            }

            // Dairy Feeds
            if (!db.objectStoreNames.contains('dairy_feeds')) {
                const feedsStore = db.createObjectStore('dairy_feeds', { keyPath: 'id', autoIncrement: true });
                feedsStore.createIndex('date', 'date');
            }

            // Avocado Sales
            if (!db.objectStoreNames.contains('avocado_sales')) {
                const avocadoStore = db.createObjectStore('avocado_sales', { keyPath: 'id', autoIncrement: true });
                avocadoStore.createIndex('date', 'date');
            }

            // Labor Logs
            if (!db.objectStoreNames.contains('labor_logs')) {
                const laborStore = db.createObjectStore('labor_logs', { keyPath: 'id', autoIncrement: true });
                laborStore.createIndex('worker_id', 'worker_id');
                laborStore.createIndex('date', 'date');
                laborStore.createIndex('task_type', 'task_type');
            }

            // Payroll
            if (!db.objectStoreNames.contains('payroll')) {
                const payrollStore = db.createObjectStore('payroll', { keyPath: 'id', autoIncrement: true });
                payrollStore.createIndex('month_year', ['month', 'year']);
                payrollStore.createIndex('worker_id', 'worker_id');
            }

            // Expenses
            if (!db.objectStoreNames.contains('expenses')) {
                const expensesStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
                expensesStore.createIndex('category', 'category');
                expensesStore.createIndex('date', 'date');
            }

            // Livestock - Cows
            if (!db.objectStoreNames.contains('cows')) {
                const cowsStore = db.createObjectStore('cows', { keyPath: 'id', autoIncrement: true });
                cowsStore.createIndex('name', 'name');
                cowsStore.createIndex('status', 'status');

                // Seed initial 5 cows
                cowsStore.add({ name: 'Cow 1', tag: 'C001', status: 'Milking', breed: 'Friesian', dob: '2020-03-15', notes: '' });
                cowsStore.add({ name: 'Cow 2', tag: 'C002', status: 'Milking', breed: 'Friesian', dob: '2020-06-20', notes: '' });
                cowsStore.add({ name: 'Cow 3', tag: 'C003', status: 'Pregnant', breed: 'Friesian', dob: '2019-11-10', notes: 'Due Dec 2024' });
                cowsStore.add({ name: 'Calf 1', tag: 'C004', status: 'Calf', breed: 'Friesian', dob: '2024-05-12', notes: 'Not yet milking' });
                cowsStore.add({ name: 'Calf 2', tag: 'C005', status: 'Calf', breed: 'Friesian', dob: '2024-07-08', notes: 'Not yet milking' });
            }

            // AI Services (Artificial Insemination)
            if (!db.objectStoreNames.contains('ai_services')) {
                const aiStore = db.createObjectStore('ai_services', { keyPath: 'id', autoIncrement: true });
                aiStore.createIndex('cow_id', 'cow_id');
                aiStore.createIndex('date', 'date');
            }

            // Calvings
            if (!db.objectStoreNames.contains('calvings')) {
                const calvingsStore = db.createObjectStore('calvings', { keyPath: 'id', autoIncrement: true });
                calvingsStore.createIndex('cow_id', 'cow_id');
                calvingsStore.createIndex('date', 'date');
            }

            // Poultry
            if (!db.objectStoreNames.contains('poultry')) {
                const poultryStore = db.createObjectStore('poultry', { keyPath: 'id', autoIncrement: true });
                poultryStore.createIndex('date', 'date');
            }

            // Poultry Feeds
            if (!db.objectStoreNames.contains('poultry_feeds')) {
                const poultryFeedsStore = db.createObjectStore('poultry_feeds', { keyPath: 'id', autoIncrement: true });
                poultryFeedsStore.createIndex('date', 'date');
                poultryFeedsStore.createIndex('feed_type', 'feed_type');
            }

            // Seed Sample Data if upgrading to v4 (or creating new)
            if (newVersion >= 4) {
                // We need to wait for the stores to be ready, but in upgrade transaction we can use them directly
                // However, we can't easily query IDs here. So we'll just add some dummy data blindly or skip complex logic.
                // Better approach: We'll add a separate 'seeding' function that runs on app start if empty.
                // But for now, let's just ensure the stores exist.
            }
        },
    });
};

// Helper to seed random data (can be called from UI or console)
export const seedSampleData = async () => {
    const db = await initDB();
    const workers = await db.getAll('workers');
    const factories = await db.getAll('factories');

    if (workers.length === 0 || factories.length === 0) return;

    // Check if we already have data to avoid duplicates
    const existing = await db.getAll('tea_plucking');
    if (existing.length > 100) return; // Already seeded

    const tx = db.transaction(['tea_plucking', 'dairy_production', 'avocado_sales'], 'readwrite');

    // 1. Tea Plucking (Jan - Nov 2024)
    for (let month = 0; month < 11; month++) {
        const daysInMonth = new Date(2024, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day += 2) { // Every other day
            const date = `2024-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Random 5 workers pluck tea
            for (let i = 0; i < 5; i++) {
                const worker = workers[Math.floor(Math.random() * workers.length)];
                const factory = factories[Math.floor(Math.random() * factories.length)];
                const weight = Math.floor(Math.random() * 50) + 20; // 20-70kg

                tx.objectStore('tea_plucking').add({
                    worker_id: worker.id,
                    factory_id: factory.id,
                    weight,
                    date,
                    created_at: new Date()
                });
            }
        }
    }

    // 2. Dairy (Daily)
    for (let month = 0; month < 11; month++) {
        const daysInMonth = new Date(2024, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `2024-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            tx.objectStore('dairy_production').add({
                date,
                liters: Math.floor(Math.random() * 30) + 40, // 40-70L
                sold: Math.floor(Math.random() * 30) + 30,
                price: 60
            });
        }
    }

    // 3. Avocado (Occasional)
    for (let month = 0; month < 11; month++) {
        if (month % 3 === 0) { // Every 3 months
            const date = `2024-${String(month + 1).padStart(2, '0')}-15`;
            tx.objectStore('avocado_sales').add({
                date,
                kg: Math.floor(Math.random() * 500) + 200,
                buyer: 'Tuskys',
                rate: 40,
                total: (Math.floor(Math.random() * 500) + 200) * 40
            });
        }
    }

    await tx.done;
    console.log('Seeding complete');
};

export const dbService = {
    // Generic helpers
    async getAll(storeName) {
        const db = await initDB();
        // Auto-seed if workers are missing (hacky but effective for demo)
        if (storeName === 'workers') {
            const count = await db.count('workers');
            if (count === 0) {
                await seedSampleData();
                return db.getAll(storeName);
            }
        }
        return db.getAll(storeName);
    },

    async get(storeName, key) {
        const db = await initDB();
        return db.get(storeName, key);
    },

    async add(storeName, item) {
        const db = await initDB();
        return db.add(storeName, item);
    },

    async put(storeName, item) {
        const db = await initDB();
        return db.put(storeName, item);
    },

    async delete(storeName, key) {
        const db = await initDB();
        return db.delete(storeName, key);
    },

    async authenticateUser(email, password) {
        const db = await initDB();
        const user = await db.get('users', email);
        if (!user) {
            if (email === 'admin@farm.com' && password === 'admin123') {
                const newUser = { email, password, name: 'Farm Admin', role: 'admin' };
                await db.add('users', newUser);
                // Trigger seeding on first admin login if needed, or let the user do it
                seedSampleData();
                return newUser;
            }
            throw new Error('User not found');
        }
        if (user.password !== password) throw new Error('Invalid password');
        return user;
    }
};
