import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { DEFAULT_HELP_PRESETS } from '../src/services/helpContentService';
import { DEFAULT_KNOWLEDGE_PRESETS } from '../src/services/knowledgeHubService';
import { PRESET_MARKET_ITEMS } from '../src/services/marketService';
import { RECOVERED_OLD_MARKET_ITEMS } from '../src/data/recoveredOldDbMarket';
import { DEFAULT_PRESETS as DEFAULT_IMAGE_PRESETS } from '../src/services/imageAssetService';

const newConfig = {
  apiKey: 'AIzaSyCj9t2yfkixOVaHGW-GIaB7oq7nxqXleI0',
  authDomain: 'studio-7279538363-d9e82.firebaseapp.com',
  projectId: 'studio-7279538363-d9e82',
  storageBucket: 'studio-7279538363-d9e82.firebasestorage.app',
  messagingSenderId: '152834017745',
  appId: '1:152834017745:web:6b391d6d0f380b1151b8f0',
};

async function seedAll() {
  console.log('🌱 Starting comprehensive data seed to studio-7279538363-d9e82...');
  const app = initializeApp(newConfig, 'seedApp');
  const db = getFirestore(app);

  // 1. Connection test
  await setDoc(doc(db, 'test', 'connection'), {
    status: 'active',
    timestamp: Date.now(),
    service: 'WorkGen AI Enterprise',
  });
  console.log('✓ Connection document set');

  // 2. Help contents
  for (const item of DEFAULT_HELP_PRESETS) {
    await setDoc(doc(db, 'help_contents', item.id), item, { merge: true });
  }
  console.log(`✓ Seeded ${DEFAULT_HELP_PRESETS.length} help contents`);

  // 3. Knowledge Hub
  for (const item of DEFAULT_KNOWLEDGE_PRESETS) {
    await setDoc(doc(db, 'knowledge_hub', item.id), item, { merge: true });
  }
  console.log(`✓ Seeded ${DEFAULT_KNOWLEDGE_PRESETS.length} knowledge hub items`);

  // 4. Public Images
  for (const item of DEFAULT_IMAGE_PRESETS) {
    await setDoc(doc(db, 'public_images', item.id), item, { merge: true });
  }
  console.log(`✓ Seeded ${DEFAULT_IMAGE_PRESETS.length} public image assets`);

  // 5. Market Items (Presets + Recovered from Old DB)
  const combinedMarket = new Map<string, any>();
  PRESET_MARKET_ITEMS.forEach((it) => combinedMarket.set(it.id, it));
  RECOVERED_OLD_MARKET_ITEMS.forEach((it) => combinedMarket.set(it.id, it));

  for (const item of combinedMarket.values()) {
    await setDoc(doc(db, 'market_items', item.id), item, { merge: true });
  }
  console.log(`✓ Seeded ${combinedMarket.size} market items (including recovered old DB templates)`);

  console.log('🎉 ALL DATA SEEDED SUCCESSFULLY TO studio-7279538363-d9e82!');
  process.exit(0);
}

seedAll().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
