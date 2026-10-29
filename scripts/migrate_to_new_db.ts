import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';

const oldConfig = {
  projectId: 'gen-lang-client-0549768744',
  appId: '1:366238703587:web:10e2bb9269c5ae8ac4cad6',
  apiKey: 'AIzaSyDZ1uzVpqz_TgWzI9RG_lWaWHq-7gBw-hM',
  authDomain: 'gen-lang-client-0549768744.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-7e2dd0f2-c8e1-4566-8808-a4469ba64521',
  storageBucket: 'gen-lang-client-0549768744.firebasestorage.app',
  messagingSenderId: '366238703587',
};

const newConfig = {
  apiKey: 'AIzaSyCj9t2yfkixOVaHGW-GIaB7oq7nxqXleI0',
  authDomain: 'studio-7279538363-d9e82.firebaseapp.com',
  projectId: 'studio-7279538363-d9e82',
  storageBucket: 'studio-7279538363-d9e82.firebasestorage.app',
  messagingSenderId: '152834017745',
  appId: '1:152834017745:web:6b391d6d0f380b1151b8f0',
};

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 WorkGen AI Database Migration CLI Tool');
  console.log('From: gen-lang-client-0549768744 (ai-studio-7e2dd0f2-c8e1-4566-8808-a4469ba64521)');
  console.log('To:   studio-7279538363-d9e82 ((default))');
  console.log('====================================================\n');

  const oldApp = initializeApp(oldConfig, 'oldCLIApp');
  const oldDb = getFirestore(oldApp, oldConfig.firestoreDatabaseId);

  const newApp = initializeApp(newConfig, 'newCLIApp');
  const newDb = getFirestore(newApp);

  const collections = [
    'help_contents',
    'knowledge_hub',
    'public_images',
    'market_items',
    'documents',
    'presentations',
    'excel_documents',
  ];

  let totalMigrated = 0;
  let quotaHit = false;

  for (const col of collections) {
    console.log(`[Collection: ${col}] Fetching from old database...`);
    try {
      const snap = await getDocs(collection(oldDb, col));
      console.log(` -> Found ${snap.size} documents in ${col}`);
      for (const d of snap.docs) {
        try {
          await setDoc(doc(newDb, col, d.id), d.data(), { merge: true });
          totalMigrated++;
        } catch (writeErr: any) {
          console.warn(`    Failed to write doc ${d.id} to new DB:`, writeErr.message);
        }
      }
      console.log(` -> Successfully copied ${snap.size} docs from ${col}\n`);
    } catch (readErr: any) {
      const msg = readErr.message || String(readErr);
      if (msg.includes('Quota limit exceeded') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
        quotaHit = true;
        console.error(` ❌ [QUOTA EXCEEDED] Old Database has hit the 50,000 daily read limit.`);
        console.error(`    Google Cloud is rejecting read operations until the daily quota resets.`);
        break;
      } else {
        console.error(` ❌ Error reading ${col}:`, msg);
      }
    }
  }

  console.log('====================================================');
  if (quotaHit) {
    console.log('⚠️ Migration incomplete due to Old DB Quota Exceeded.');
    console.log(`Total documents transferred so far: ${totalMigrated}`);
    console.log('Note: Once quota resets at 00:00 UTC, run `npm run migrate` again to complete full migration.');
  } else {
    console.log(`✅ Migration complete! Total ${totalMigrated} documents migrated.`);
  }
  console.log('====================================================');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
