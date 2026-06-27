import { initializeApp, deleteApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc
} from 'firebase/firestore';
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const firebaseConfig = {
    apiKey: 'AIzaSyDk7F8oWz3NI-Ikd8crh0mWGdAZLhdC6fU',
    authDomain: 'viking-vault-c8c2a.firebaseapp.com',
    projectId: 'viking-vault-c8c2a',
    storageBucket: 'viking-vault-c8c2a.firebasestorage.app',
    messagingSenderId: '182969920672',
    appId: '1:182969920672:web:10656fccf940951ba42dc5',
    measurementId: 'G-M5RWRJH460'
};

const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

function getContentType(filePath) {
    return contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function migratePhotos() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);
    let migrated = 0;
    let skipped = 0;

    try {
        const snapshot = await getDocs(collection(db, 'items'));

        for (const itemDoc of snapshot.docs) {
            const item = itemDoc.data();
            if (!item.photo || !item.photo.startsWith('/uploads/')) {
                skipped += 1;
                continue;
            }

            const localPhotoPath = path.join(projectRoot, 'public', item.photo);
            if (!fs.existsSync(localPhotoPath)) {
                console.warn(`Skipping ${itemDoc.id}: missing local file ${localPhotoPath}`);
                skipped += 1;
                continue;
            }

            const fileName = path.basename(localPhotoPath);
            const remotePath = `item-photos/migrated/${fileName}`;
            const photoRef = storageRef(storage, remotePath);
            const fileBuffer = fs.readFileSync(localPhotoPath);

            await uploadBytes(photoRef, fileBuffer, {
                contentType: getContentType(localPhotoPath),
                customMetadata: {
                    migratedFrom: item.photo,
                    itemId: itemDoc.id
                }
            });

            const downloadUrl = await getDownloadURL(photoRef);
            await updateDoc(doc(db, 'items', itemDoc.id), { photo: downloadUrl });
            migrated += 1;
            console.log(`Migrated ${itemDoc.id}: ${item.photo} -> ${downloadUrl}`);
        }

        console.log(`Done. Migrated ${migrated} photos, skipped ${skipped} items.`);
    } finally {
        await deleteApp(app);
    }
}

migratePhotos().catch(error => {
    console.error('Photo migration failed:', error.message);
    process.exitCode = 1;
});
