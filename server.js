// ========================================
// Viking Vault / FoundIt Express Server
// ----------------------------------------
// This file runs the backend for the lost-and-found website.
// It serves the public frontend, accepts item/claim/lost-item reports,
// reads and writes Firestore data, handles admin actions, sends optional
// email notifications, and exposes analytics endpoints such as stats and
// heat map report concentration data.
// ========================================

// Firebase app initialization gives the server access to Firestore.
import { initializeApp } from 'firebase/app';
// Firestore helpers are used for CRUD operations against collections/documents.
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
// Express provides the HTTP server and API routing.
import express from 'express';
// Multer processes uploaded found-item photos before saving them.
import multer from 'multer';
// path/fileURLToPath/fs help this ES module work with filesystem paths.
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// uuid creates unique IDs for items, claims, and lost-item reports.
import { v4 as uuidv4 } from 'uuid';
// Nodemailer sends optional match notification emails.
import nodemailer from 'nodemailer';

// Convert ES module URL values into normal filesystem paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express application instance.
const app = express();
// Render provides process.env.PORT in production; 3001 remains the local fallback.
const PORT = process.env.PORT || 3001;

// Firebase configuration connects this server to the Viking Vault Firestore project.
const firebaseConfig = {
    apiKey: "AIzaSyDk7F8oWz3NI-Ikd8crh0mWGdAZLhdC6fU",
    authDomain: "viking-vault-c8c2a.firebaseapp.com",
    projectId: "viking-vault-c8c2a",
    storageBucket: "viking-vault-c8c2a.firebasestorage.app",
    messagingSenderId: "182969920672",
    appId: "1:182969920672:web:10656fccf940951ba42dc5",
    measurementId: "G-M5RWRJH460"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Email configuration is loaded from email.config.json when present.
// If the config file is missing or disabled, the app still works without email.
const EMAIL_CONFIG_PATH = path.join(__dirname, 'email.config.json');
let EMAIL_CONFIG = {
    enabled: false,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: '',
    from: 'vikingfinder@sbhs.edu',
    siteUrl: 'http://localhost:3001'
};

// Load optional local email settings without crashing the app if they are invalid.
if (fs.existsSync(EMAIL_CONFIG_PATH)) {
    try {
        const configFile = fs.readFileSync(EMAIL_CONFIG_PATH, 'utf8');
        EMAIL_CONFIG = { ...EMAIL_CONFIG, ...JSON.parse(configFile) };
    } catch (error) {
        console.warn('⚠️  Could not load email.config.json, using defaults:', error.message);
    }
}

// emailTransporter remains null unless email has been explicitly configured.
let emailTransporter = null;
if (EMAIL_CONFIG.enabled && EMAIL_CONFIG.user && EMAIL_CONFIG.password) {
    const cleanPassword = EMAIL_CONFIG.password.replace(/\s+/g, '');
    emailTransporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: {
            user: EMAIL_CONFIG.user,
            pass: cleanPassword
        }
    });
}

// Create uploads directory so image uploads have a safe destination on startup.
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local fallback storage keeps demo/local submissions working when Firestore rules block writes.
const localDataDir = path.join(__dirname, 'data');
const localLostItemsPath = path.join(localDataDir, 'lost-items.json');
const localClaimsPath = path.join(localDataDir, 'claims.json');
const localItemsPath = path.join(localDataDir, 'items.json');

// Ensure the local data folder exists before any fallback writes are attempted.
if (!fs.existsSync(localDataDir)) {
    fs.mkdirSync(localDataDir, { recursive: true });
}

// Read locally saved lost-item reports; used only when Firestore is unavailable/denied.
function readLocalLostItems() {
    if (!fs.existsSync(localLostItemsPath)) return [];

    try {
        return JSON.parse(fs.readFileSync(localLostItemsPath, 'utf8'));
    } catch (error) {
        console.warn('⚠️  Could not read local lost-items fallback file:', error.message);
        return [];
    }
}

// Read locally saved claims when Firestore rules block claim reads/writes.
function readLocalClaims() {
    if (!fs.existsSync(localClaimsPath)) return [];

    try {
        return JSON.parse(fs.readFileSync(localClaimsPath, 'utf8'));
    } catch (error) {
        console.warn('⚠️  Could not read local claims fallback file:', error.message);
        return [];
    }
}

// Read locally saved found-item reports when Firestore blocks item reads/writes.
function readLocalItems() {
    if (!fs.existsSync(localItemsPath)) return [];

    try {
        return JSON.parse(fs.readFileSync(localItemsPath, 'utf8'));
    } catch (error) {
        console.warn('⚠️  Could not read local items fallback file:', error.message);
        return [];
    }
}

// Save the local lost-item fallback file with readable formatting for easy debugging.
function writeLocalLostItems(lostItems) {
    fs.writeFileSync(localLostItemsPath, JSON.stringify(lostItems, null, 2));
}

// Save the local claims fallback file with readable formatting for easy debugging.
function writeLocalClaims(claims) {
    fs.writeFileSync(localClaimsPath, JSON.stringify(claims, null, 2));
}

// Save the local found-items fallback file with readable formatting for debugging.
function writeLocalItems(items) {
    fs.writeFileSync(localItemsPath, JSON.stringify(items, null, 2));
}

// Insert or replace a lost item in local fallback storage.
function upsertLocalLostItem(lostItem) {
    const lostItems = readLocalLostItems();
    const existingIndex = lostItems.findIndex(item => item.id === lostItem.id);

    if (existingIndex >= 0) {
        lostItems[existingIndex] = lostItem;
    } else {
        lostItems.push(lostItem);
    }

    writeLocalLostItems(lostItems);
}

// Insert or replace a claim in local fallback storage.
function upsertLocalClaim(claim) {
    const claims = readLocalClaims();
    const existingIndex = claims.findIndex(item => item.id === claim.id);

    if (existingIndex >= 0) {
        claims[existingIndex] = claim;
    } else {
        claims.push(claim);
    }

    writeLocalClaims(claims);
}

// Insert or replace a found item in local fallback storage.
function upsertLocalItem(item) {
    const items = readLocalItems();
    const existingIndex = items.findIndex(existingItem => existingItem.id === item.id);

    if (existingIndex >= 0) {
        items[existingIndex] = item;
    } else {
        items.push(item);
    }

    writeLocalItems(items);
}

// Update one locally stored found item, mirroring the Firestore update shape.
function updateLocalItem(id, updates) {
    const items = readLocalItems();
    const existingIndex = items.findIndex(item => item.id === id);
    if (existingIndex === -1) return null;

    items[existingIndex] = { ...items[existingIndex], ...updates };
    writeLocalItems(items);
    return items[existingIndex];
}

// Delete one locally stored found item.
function deleteLocalItem(id) {
    const items = readLocalItems();
    writeLocalItems(items.filter(item => item.id !== id));
}

// Update one locally stored claim, mirroring the Firestore update shape.
function updateLocalClaim(id, updates) {
    const claims = readLocalClaims();
    const existingIndex = claims.findIndex(item => item.id === id);
    if (existingIndex === -1) return null;

    claims[existingIndex] = { ...claims[existingIndex], ...updates };
    writeLocalClaims(claims);
    return claims[existingIndex];
}

// Update one locally stored lost item, mirroring the Firestore update shape.
function updateLocalLostItem(id, updates) {
    const lostItems = readLocalLostItems();
    const existingIndex = lostItems.findIndex(item => item.id === id);
    if (existingIndex === -1) return null;

    lostItems[existingIndex] = { ...lostItems[existingIndex], ...updates };
    writeLocalLostItems(lostItems);
    return lostItems[existingIndex];
}

// Firestore exposes permission-denied errors with slightly different code/message shapes.
function isPermissionDenied(error) {
    return error?.code === 'permission-denied' || /PERMISSION_DENIED|permission/i.test(error?.message || '');
}

// Read collections without crashing admin dashboards when Firestore rules deny access.
async function getCollectionSafe(collectionName) {
    try {
        return await getCollection(collectionName);
    } catch (error) {
        if (!isPermissionDenied(error)) throw error;

        console.warn(`⚠️  Firestore blocked ${collectionName} read; using fallback:`, error.message);

        if (collectionName === 'lostItems') return readLocalLostItems();
        if (collectionName === 'claims') return readLocalClaims();
        if (collectionName === 'items') return readLocalItems();
        return [];
    }
}

// Normalize date input into YYYY-MM-DD; rejects invalid dates instead of storing bad data.
function normalizeDateValue(value) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
}

// Firestore helper functions keep route handlers short and consistent.
async function getCollection(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getDocument(collectionName, id) {
    const snap = await getDoc(doc(db, collectionName, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

async function setDocument(collectionName, id, data) {
    await setDoc(doc(db, collectionName, id), data);
}

async function updateDocument(collectionName, id, data) {
    await updateDoc(doc(db, collectionName, id), data);
}

async function deleteDocument(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
}

// Ensures first-time deployments have default admin credentials available.
// The login route also has a local fallback for these values if Firestore is unavailable.
async function initAdminCredentials() {
    try {
        const adminSnap = await getDoc(doc(db, 'config', 'admin'));
        if (!adminSnap.exists()) {
            await setDoc(doc(db, 'config', 'admin'), { username: 'admin', password: 'school2024' });
            console.log('✅ Admin credentials initialized in Firestore');
        }
    } catch (error) {
        console.error('⚠️  Could not initialize admin credentials:', error.message);
    }
}

// Middleware parses incoming JSON/form submissions and serves files from /public.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// ========================================
// Public API Routes
// ========================================
// These routes power the student-facing website: browsing approved items,
// submitting found items, submitting claims, submitting lost reports, and
// reading public stats/heat map data.

// Get all approved/claimed found items, optionally filtered by search/category/sort.
app.get('/api/items', async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let items = (await getCollectionSafe('items')).filter(item => item.status === 'approved' || item.status === 'claimed');

        if (category && category !== 'all') {
            items = items.filter(item => item.category === category);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                (item.description && item.description.toLowerCase().includes(searchLower)) ||
                item.location.toLowerCase().includes(searchLower)
            );
        }

        if (sort === 'oldest') {
            items.sort((a, b) => new Date(a.date_found) - new Date(b.date_found));
        } else {
            items.sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
        }

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Get a single found item by ID for the item detail modal.
app.get('/api/items/:id', async (req, res) => {
    try {
        let item;

        try {
            item = await getDocument('items', req.params.id);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked item lookup; checking local fallback:', error.message);
            item = readLocalItems().find(localItem => localItem.id === req.params.id);
        }

        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// Submit a found item for admin review; photo upload is optional.
app.post('/api/items', upload.single('photo'), async (req, res) => {
    try {
        const title = req.body.title?.trim();
        const category = req.body.category?.trim();
        const location = (req.body.location || req.body.locationFound || '').trim();
        const date_found = normalizeDateValue(req.body.date_found || req.body.dateFound || '');
        const finder_name = (req.body.finder_name || req.body.finderName || req.body.name || '').trim();
        const finder_email = (req.body.finder_email || req.body.finderEmail || req.body.email || '').trim();
        const finder_phone = (req.body.finder_phone || req.body.finderPhone || req.body.phone || '').trim();
        const description = (req.body.description || '').trim();

        if (!title || !category || !location || !date_found || !finder_name || !finder_email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date_found)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const id = uuidv4();
        const newItem = {
            id,
            title,
            description: description || '',
            category,
            location,
            date_found,
            finder_name,
            finder_email,
            finder_phone: finder_phone || '',
            photo: req.file ? `/uploads/${req.file.filename}` : null,
            status: 'pending',
            created_at: new Date().toISOString(),
            history: [{
                action: 'found',
                timestamp: new Date().toISOString(),
                by: finder_name,
                email: finder_email,
                details: `Found at ${location} on ${date_found}`
            }]
        };

        try {
            await setDocument('items', id, newItem);
            res.status(201).json({ message: 'Report submitted successfully', id });
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked found-item write; saved to local fallback:', error.message);
            upsertLocalItem(newItem);
            res.status(201).json({
                message: 'Report submitted successfully',
                id,
                storage: 'local'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to submit item' });
    }
});

// Submit an ownership claim for a found item.
app.post('/api/claims', async (req, res) => {
    try {
        const { item_id, claimant_name, claimant_email, claimant_phone, description } = req.body;

        if (!item_id || !claimant_name || !claimant_email || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const id = uuidv4();
        const newClaim = {
            id,
            item_id,
            claimant_name,
            claimant_email,
            claimant_phone: claimant_phone || '',
            description,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        try {
            await setDocument('claims', id, newClaim);

            const item = await getDocument('items', item_id);
            if (item) {
                const history = item.history || [];
                history.push({
                    action: 'claim_submitted',
                    timestamp: new Date().toISOString(),
                    by: claimant_name,
                    email: claimant_email,
                    details: `Claim submitted: ${description.substring(0, 50)}...`
                });
                await updateDocument('items', item_id, { history });
            }
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked claim write; saved to local fallback:', error.message);
            upsertLocalClaim(newClaim);
        }

        res.status(201).json({ message: 'Claim submitted successfully! We will contact you soon.', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit claim' });
    }
});

// Submit a lost item report so staff can match it against found items.
app.post('/api/lost-items', async (req, res) => {
    try {
        // Accept both the form's snake_case names and common camelCase aliases.
        const title = req.body.title?.trim();
        const category = req.body.category?.trim();
        const location_lost = (req.body.location_lost || req.body.locationLost || '').trim();
        const date_lost = normalizeDateValue(req.body.date_lost || req.body.dateLost || '');
        const owner_name = (req.body.owner_name || req.body.ownerName || req.body.name || '').trim();
        const owner_email = (req.body.owner_email || req.body.ownerEmail || req.body.email || '').trim();
        const owner_phone = (req.body.owner_phone || req.body.ownerPhone || req.body.phone || '').trim();
        const description = (req.body.description || '').trim();

        if (!title || !category || !location_lost || !date_lost || !owner_name || !owner_email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date_lost)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const id = uuidv4();
        const newLostItem = {
            id,
            title,
            description: description || '',
            category,
            location_lost,
            date_lost,
            owner_name,
            owner_email,
            owner_phone: owner_phone || '',
            status: 'active',
            created_at: new Date().toISOString(),
            matched_item_id: null
        };

        try {
            await setDocument('lostItems', id, newLostItem);
            res.status(201).json({ message: 'Report submitted successfully', id });
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked lost-item write; saved to local fallback:', error.message);
            upsertLocalLostItem(newLostItem);
            res.status(201).json({
                message: 'Report submitted successfully',
                id,
                storage: 'local'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to report lost item' });
    }
});

// ========================================
// Admin Authentication
// ========================================
// Validates admin credentials and uses a default fallback for local/demo use.
app.post('/api/admin/login', async (req, res) => {
    const defaultAdmin = { username: 'admin', password: 'school2024' };

    try {
        const { username, password } = req.body;
        const admin = await getDocument('config', 'admin');

        if (
            (admin && admin.username === username && admin.password === password) ||
            (username === defaultAdmin.username && password === defaultAdmin.password)
        ) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        const { username, password } = req.body;

        if (username === defaultAdmin.username && password === defaultAdmin.password) {
            res.json({ success: true, message: 'Login successful' });
            return;
        }

        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// ========================================
// Admin Management API Routes
// ========================================
// These routes are used only by the admin panel after sign-in.

// Get all item submissions for admin review, optionally filtered by status.
app.get('/api/admin/items', async (req, res) => {
    try {
        const { status } = req.query;
        let items = await getCollectionSafe('items');

        if (status && status !== 'all') {
            items = items.filter(item => item.status === status);
        }

        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Update item status (admin)
app.patch('/api/admin/items/:id', async (req, res) => {
    try {
        const { status, admin_name } = req.body;
        const { id } = req.params;

        if (!['pending', 'approved', 'claimed', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let item;

        try {
            item = await getDocument('items', id);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked item lookup; checking local fallback:', error.message);
            item = readLocalItems().find(localItem => localItem.id === id);
        }

        if (!item) return res.status(404).json({ error: 'Item not found' });

        const oldStatus = item.status;
        const history = item.history || [];
        history.push({
            action: 'status_changed',
            timestamp: new Date().toISOString(),
            by: admin_name || 'Admin',
            details: `Status changed from ${oldStatus} to ${status}`
        });

        if (status === 'approved' && oldStatus === 'pending') {
            history.push({
                action: 'approved',
                timestamp: new Date().toISOString(),
                by: admin_name || 'Admin',
                details: 'Item approved and made public'
            });
        }

        try {
            await updateDocument('items', id, { status, history });
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked item update; updating local fallback:', error.message);
            updateLocalItem(id, { status, history });
        }
        res.json({ message: 'Item status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item (admin)
app.delete('/api/admin/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let item;

        try {
            item = await getDocument('items', id);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked item lookup; checking local fallback:', error.message);
            item = readLocalItems().find(localItem => localItem.id === id);
        }

        if (!item) return res.status(404).json({ error: 'Item not found' });

        if (item.photo) {
            const photoPath = path.join(__dirname, 'public', item.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        const claims = await getCollectionSafe('claims');
        await Promise.all(
            claims.filter(c => c.item_id === id).map(async c => {
                try {
                    await deleteDocument('claims', c.id);
                } catch (error) {
                    if (!isPermissionDenied(error)) throw error;

                    writeLocalClaims(readLocalClaims().filter(claim => claim.id !== c.id));
                }
            })
        );

        try {
            await deleteDocument('items', id);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked item delete; deleting local fallback:', error.message);
            deleteLocalItem(id);
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Get all submitted claims and include the matching item title for readability.
app.get('/api/admin/claims', async (req, res) => {
    try {
        const [claims, items] = await Promise.all([
            getCollectionSafe('claims'),
            getCollectionSafe('items')
        ]);

        const claimsWithItems = claims.map(claim => {
            const item = items.find(i => i.id === claim.item_id);
            return { ...claim, item_title: item ? item.title : 'Unknown Item' };
        });

        claimsWithItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(claimsWithItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// Update claim status and mark the item claimed when a claim is approved.
app.patch('/api/admin/claims/:id', async (req, res) => {
    try {
        const { status, admin_name } = req.body;
        const { id } = req.params;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let claim;

        try {
            claim = await getDocument('claims', id);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked claim lookup; checking local fallback:', error.message);
            claim = readLocalClaims().find(item => item.id === id);
        }

        if (!claim) return res.status(404).json({ error: 'Claim not found' });

        try {
            await updateDocument('claims', id, { status });
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked claim update; updating local fallback:', error.message);
            updateLocalClaim(id, { status });
        }

        if (status === 'approved') {
            let item;

            try {
                item = await getDocument('items', claim.item_id);
            } catch (error) {
                if (!isPermissionDenied(error)) throw error;

                console.warn('⚠️  Firestore blocked item lookup during claim approval; checking local fallback:', error.message);
                item = readLocalItems().find(localItem => localItem.id === claim.item_id);
            }

            if (item) {
                const history = item.history || [];
                history.push({
                    action: 'claimed',
                    timestamp: new Date().toISOString(),
                    by: claim.claimant_name,
                    email: claim.claimant_email,
                    details: `Item claimed by ${claim.claimant_name}. Approved by ${admin_name || 'Admin'}`
                });
                try {
                    await updateDocument('items', claim.item_id, { status: 'claimed', history });
                } catch (error) {
                    if (!isPermissionDenied(error)) throw error;

                    console.warn('⚠️  Firestore blocked item claim update; updating local fallback:', error.message);
                    updateLocalItem(claim.item_id, { status: 'claimed', history });
                }
            }
        }

        res.json({ message: 'Claim status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update claim' });
    }
});

// Get dashboard stats for the admin landing page cards and category chart.
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [items, claims, lostItems] = await Promise.all([
            getCollectionSafe('items'),
            getCollectionSafe('claims'),
            getCollectionSafe('lostItems')
        ]);
        const mergedLostItems = [
            ...lostItems,
            ...readLocalLostItems().filter(localItem => !lostItems.some(item => item.id === localItem.id))
        ];

        const categoryCounts = {};
        items.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentItems = items.filter(item => new Date(item.created_at) >= thirtyDaysAgo);

        res.json({
            totalItems: items.length,
            pendingItems: items.filter(i => i.status === 'pending').length,
            approvedItems: items.filter(i => i.status === 'approved').length,
            claimedItems: items.filter(i => i.status === 'claimed').length,
            rejectedItems: items.filter(i => i.status === 'rejected').length,
            pendingClaims: claims.filter(c => c.status === 'pending').length,
            activeLostItems: mergedLostItems.filter(l => l.status === 'active').length,
            categoryCounts,
            recentItemsCount: recentItems.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get public-facing statistics for the Stats page.
app.get('/api/stats', async (req, res) => {
    try {
        const items = await getCollectionSafe('items');
        const approvedItems = items.filter(i => i.status === 'approved' || i.status === 'claimed');

        const categoryCounts = {};
        approvedItems.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthItems = approvedItems.filter(item => new Date(item.date_found) >= startOfMonth);

        const claimedCount = approvedItems.filter(i => i.status === 'claimed').length;
        const successRate = approvedItems.length > 0 ? Math.round((claimedCount / approvedItems.length) * 100) : 0;

        res.json({
            totalFoundItems: approvedItems.length,
            itemsThisMonth: thisMonthItems.length,
            claimedItems: claimedCount,
            successRate,
            categoryCounts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get heat map report concentration by school location.
// This combines found-item and lost-item reports into location buckets.
app.get('/api/heatmap', async (req, res) => {
    try {
        const [items, lostItems] = await Promise.all([
            getCollectionSafe('items'),
            getCollectionSafe('lostItems')
        ]);

        const locationCounts = {};

        function addReport(location, title, category, type) {
            const key = normalizeHeatmapLocation(location);
            if (!key) return;

            if (!locationCounts[key]) {
                locationCounts[key] = {
                    location: key,
                    count: 0,
                    foundCount: 0,
                    lostCount: 0,
                    itemTypes: {}
                };
            }

            const bucket = locationCounts[key];
            const itemType = normalizeHeatmapItemType(title || category || 'Other');
            bucket.count += 1;
            bucket.itemTypes[itemType] = (bucket.itemTypes[itemType] || 0) + 1;
            if (type === 'found') bucket.foundCount += 1;
            if (type === 'lost') bucket.lostCount += 1;
        }

        items
            .filter(item => item && (item.status === 'approved' || item.status === 'claimed'))
            .forEach(item => addReport(item.location, item.title, item.category, 'found'));

        lostItems
            .filter(item => item && (item.status === 'active' || item.status === 'matched'))
            .forEach(item => addReport(item.location_lost || item.location, item.title, item.category, 'lost'));

        const locations = Object.values(locationCounts).map(location => ({
            ...location,
            commonItemTypes: Object.entries(location.itemTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type, count]) => ({ type, count }))
        }));

        res.json({ locations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch heat map data' });
    }
});

// Normalize free-text locations into common school areas for the heat map.
function normalizeHeatmapLocation(location = '') {
    const cleanLocation = String(location || '').trim();
    const lower = cleanLocation.toLowerCase();
    const knownLocations = [
        { name: 'Red Cafeteria', terms: ['red cafeteria', 'red cafe', 'cafeteria red'] },
        { name: 'Blue Cafeteria', terms: ['blue cafeteria', 'blue cafe', 'cafeteria blue'] },
        { name: 'Red Cafeteria', terms: ['cafeteria', 'lunchroom', 'commons', 'lunch'] },
        { name: 'Main Gym', terms: ['main gym', 'gym', 'gymnasium', 'athletic'] },
        { name: 'Library', terms: ['library', 'media center', 'media'] },
        { name: 'Auditorium', terms: ['auditorium', 'theater', 'theatre', 'stage'] },
        { name: 'Main Entrance', terms: ['main entrance', 'front entrance', 'entrance', 'front doors'] },
        { name: 'Main Hallway', terms: ['main hallway', 'hallway', 'main hall', 'hall'] },
        { name: 'Bus Loop', terms: ['bus loop', 'bus', 'drop off', 'pickup', 'pick up'] },
        { name: 'Locker Rooms', terms: ['locker room', 'locker rooms', 'lockers'] },
        { name: 'Guidance Office', terms: ['guidance', 'counseling', 'counselor'] },
        { name: 'Nurse Office', terms: ['nurse', 'health office'] },
        { name: 'Main Office', terms: ['main office', 'office', 'attendance'] },
        { name: 'Music Wing', terms: ['music', 'band', 'choir', 'orchestra'] },
        { name: 'Science Wing', terms: ['science', 'lab', 'laboratory'] },
        { name: 'Art Room', terms: ['art', 'art room', 'studio'] },
        { name: 'Parking Lot', terms: ['parking', 'parking lot', 'lot'] }
    ];

    const match = knownLocations.find(locationOption =>
        locationOption.terms.some(term => lower.includes(term))
    );

    if (match) return match.name;
    return cleanLocation || 'Other';
}

// Normalize item titles into reusable item-type labels for heat map details.
function normalizeHeatmapItemType(title = '') {
    const cleanTitle = String(title || '').trim();
    const lower = cleanTitle.toLowerCase();
    const knownTypes = ['backpack', 'phone', 'keys', 'airpods', 'earbuds', 'headphones', 'calculator', 'jacket', 'hoodie', 'water bottle', 'bottle', 'notebook', 'binder', 'wallet', 'glasses', 'laptop', 'book'];
    const match = knownTypes.find(type => lower.includes(type));
    const label = match || cleanTitle.split(/\s+/).slice(-2).join(' ') || 'Other';
    return label.trim().replace(/\b\w/g, char => char.toUpperCase());
}

// Get lost items for the admin matching workflow.
app.get('/api/admin/lost-items', async (req, res) => {
    try {
        const lostItems = await getCollection('lostItems');
        const localLostItems = readLocalLostItems();
        const mergedLostItems = [
            ...lostItems,
            ...localLostItems.filter(localItem => !lostItems.some(item => item.id === localItem.id))
        ];
        res.json(mergedLostItems);
    } catch (error) {
        if (isPermissionDenied(error)) {
            console.warn('⚠️  Firestore blocked lost-item read; using local fallback:', error.message);
            res.json(readLocalLostItems());
            return;
        }

        console.error(error);
        res.status(500).json({ error: 'Failed to fetch lost items' });
    }
});

// Match a lost-item report to a found item and notify the owner when possible.
app.post('/api/admin/match-item', async (req, res) => {
    try {
        const { lost_item_id, found_item_id, admin_name } = req.body;

        if (!lost_item_id || !found_item_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let lostItem;
        let foundItem;
        let lostItemSource = 'firestore';
        let foundItemSource = 'firestore';

        try {
            [lostItem, foundItem] = await Promise.all([
                getDocument('lostItems', lost_item_id),
                getDocument('items', found_item_id)
            ]);
        } catch (error) {
            if (!isPermissionDenied(error)) throw error;

            console.warn('⚠️  Firestore blocked lost-item lookup; checking local fallback:', error.message);
            lostItem = readLocalLostItems().find(item => item.id === lost_item_id);
            try {
                foundItem = await getDocument('items', found_item_id);
            } catch (itemError) {
                if (!isPermissionDenied(itemError)) throw itemError;

                foundItem = readLocalItems().find(item => item.id === found_item_id);
            }
        }

        if (!lostItem) {
            lostItem = readLocalLostItems().find(item => item.id === lost_item_id);
            if (lostItem) lostItemSource = 'local';
        }

        if (!foundItem) {
            foundItem = readLocalItems().find(item => item.id === found_item_id);
            if (foundItem) foundItemSource = 'local';
        }

        if (!lostItem || !foundItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const matchUpdates = {
            matched_item_id: found_item_id,
            status: 'matched',
            matched_at: new Date().toISOString(),
            matched_by: admin_name || 'Admin'
        };

        if (lostItemSource === 'local') {
            updateLocalLostItem(lost_item_id, matchUpdates);
        } else {
            try {
                await updateDocument('lostItems', lost_item_id, matchUpdates);
            } catch (error) {
                if (!isPermissionDenied(error)) throw error;

                console.warn('⚠️  Firestore blocked lost-item match update; updating local fallback:', error.message);
                updateLocalLostItem(lost_item_id, matchUpdates);
            }
        }

        const history = foundItem.history || [];
        history.push({
            action: 'matched_with_lost_item',
            timestamp: new Date().toISOString(),
            by: admin_name || 'Admin',
            details: `Matched with lost item report by ${lostItem.owner_name}`
        });
        if (foundItemSource === 'local') {
            updateLocalItem(found_item_id, { status: 'claimed', history });
        } else {
            try {
                await updateDocument('items', found_item_id, { status: 'claimed', history });
            } catch (error) {
                if (!isPermissionDenied(error)) throw error;

                console.warn('⚠️  Firestore blocked matched item update; updating local fallback:', error.message);
                updateLocalItem(found_item_id, { status: 'claimed', history });
            }
        }

        sendMatchNotificationEmail(lostItem, foundItem).catch(err => {
            console.error('Failed to send email notification:', err);
        });

        res.json({ message: 'Items matched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to match items' });
    }
});

// Email notification function used after an admin matches a lost and found item.
async function sendMatchNotificationEmail(lostItem, foundItem) {
    const emailContent = {
        to: lostItem.owner_email,
        subject: `🎉 Good News! Your Lost Item May Have Been Found - Viking Vault`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Great News!</h2>
                <p>Hello ${lostItem.owner_name},</p>
                <p>An item matching your lost item report has been found!</p>
                <hr/>
                <h3>Your Lost Item:</h3>
                <p><strong>${lostItem.title}</strong></p>
                <p>Category: ${lostItem.category}</p>
                <p>Location Lost: ${lostItem.location_lost}</p>
                <hr/>
                <h3>Found Item:</h3>
                <p><strong>${foundItem.title}</strong></p>
                <p>Category: ${foundItem.category}</p>
                <p>Location Found: ${foundItem.location}</p>
                <p>Please visit the website to verify if this is your item.</p>
            </div>
        `,
        text: `Great News!\n\nHello ${lostItem.owner_name},\n\nAn item matching your lost item report has been found!\n\nYour Lost Item: ${lostItem.title}\nFound Item: ${foundItem.title}\n\nPlease visit the website to verify.`
    };

    if (emailTransporter) {
        try {
            await emailTransporter.sendMail({
                from: `"Viking Vault" <${EMAIL_CONFIG.from}>`,
                ...emailContent
            });
            console.log(`✅ Email sent to ${lostItem.owner_email}`);
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }
}

// ========================================
// Server Startup
// ========================================
// Initialize default admin credentials first, then listen for HTTP traffic.
await initAdminCredentials();

app.listen(PORT, () => {
    const siteUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log(`\n🔍 Viking Vault - School Lost & Found`);
    console.log(`   Server running at ${siteUrl}`);
    console.log(`   Admin panel: ${siteUrl}/admin.html`);
    console.log(`   Default admin: username "admin", password "school2024"`);
    console.log(`   Database: Firebase Firestore (project: viking-vault-c8c2a)`);
    if (emailTransporter) {
        console.log(`   ✅ Email notifications: ENABLED`);
    } else {
        console.log(`   📧 Email notifications: Demo mode`);
    }
    console.log();
});
