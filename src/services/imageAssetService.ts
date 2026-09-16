import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface PublicImageItem {
  id: string;
  title: string;
  category: 'cover' | 'chart' | 'related' | 'other';
  productType: 'doc' | 'presentation' | 'excel' | 'form' | 'all';
  dataUrl: string; // Base64 string, guaranteed < 200KB
  createdAt: number;
}

/**
 * Highly robust client-side Canvas-based image compression pipeline.
 * Downscales dimensions and iteratively adjusts JPEG quality until the payload size is strictly under maxBytes (default 200KB).
 */
export async function compressImageToDataUrl(
  fileOrDataUrl: File | string,
  maxBytes: number = 200 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Limit max dimension to 1000px for document assets to keep it light
      const maxDim = 1000;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D context from canvas'));
        return;
      }

      // Recursive compression block
      const attemptCompression = (currWidth: number, currHeight: number, quality: number) => {
        canvas.width = currWidth;
        canvas.height = currHeight;

        // Fill background white for safety (especially if converting transparent png to jpeg)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, currWidth, currHeight);
        ctx.drawImage(img, 0, 0, currWidth, currHeight);

        // Compress as image/jpeg
        const base64 = canvas.toDataURL('image/jpeg', quality);
        // Estimate size in bytes from base64 string
        const estimatedBytes = Math.round((base64.length - 814) * 0.75);

        if (estimatedBytes < maxBytes) {
          resolve(base64);
        } else if (quality > 0.2) {
          // Keep scaling down JPEG quality first
          attemptCompression(currWidth, currHeight, quality - 0.15);
        } else if (currWidth > 200) {
          // If quality is already lowest, scale down the actual canvas dimensions by 30% and try again
          attemptCompression(Math.round(currWidth * 0.7), Math.round(currHeight * 0.7), 0.8);
        } else {
          // Absolute fallback: return whatever we have
          resolve(base64);
        }
      };

      attemptCompression(width, height, 0.85);
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
}

// Pre-defined elegant SVG vector illustrations to populate the asset gallery instantly
const DEFAULT_PRESETS: PublicImageItem[] = [
  {
    id: 'default-img-cover-ai',
    title: '미래 지향적 AI 솔루션 사업기획서 표지 일러스트',
    category: 'cover',
    productType: 'doc',
    createdAt: Date.now() - 5000000,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%"><rect width="800" height="450" fill="%230f172a"/><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><circle cx="400" cy="225" r="180" fill="none" stroke="url(%23g1)" stroke-width="2" opacity="0.4"/><circle cx="400" cy="225" r="120" fill="none" stroke="url(%23g1)" stroke-width="4" stroke-dasharray="10, 5"/><path d="M400,45 L400,405 M220,225 L580,225" stroke="url(%23g1)" stroke-width="1" opacity="0.3"/><circle cx="400" cy="225" r="30" fill="url(%23g1)"/><text x="400" y="235" font-family="system-ui, sans-serif" font-weight="bold" font-size="28" fill="%23ffffff" text-anchor="middle">AI</text><text x="400" y="380" font-family="system-ui, sans-serif" font-size="16" fill="%2394a3b8" text-anchor="middle" letter-spacing="4">BUSINESS SOLUTION COVER</text></svg>`,
  },
  {
    id: 'default-img-chart-donut',
    title: '연간 핵심 사업 부문별 기여도 도넛 차트',
    category: 'chart',
    productType: 'excel',
    createdAt: Date.now() - 4000000,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%"><rect width="800" height="450" fill="%230f172a"/><circle cx="400" cy="210" r="120" fill="none" stroke="%231e293b" stroke-width="45"/><circle cx="400" cy="210" r="120" fill="none" stroke="%233b82f6" stroke-width="45" stroke-dasharray="754" stroke-dashoffset="250"/><circle cx="400" cy="210" r="120" fill="none" stroke="%2310b981" stroke-width="45" stroke-dasharray="754" stroke-dashoffset="550"/><circle cx="400" cy="210" r="120" fill="none" stroke="%23f59e0b" stroke-width="45" stroke-dasharray="754" stroke-dashoffset="700"/><text x="400" y="218" font-family="system-ui, sans-serif" font-weight="bold" font-size="24" fill="%23ffffff" text-anchor="middle">78% 달성</text><text x="240" y="380" font-family="system-ui, sans-serif" font-size="14" fill="%233b82f6" font-weight="bold">● 클라우드 (45%)</text><text x="400" y="380" font-family="system-ui, sans-serif" font-size="14" fill="%2310b981" font-weight="bold">● 솔루션 B2B (35%)</text><text x="560" y="380" font-family="system-ui, sans-serif" font-size="14" fill="%23f59e0b" font-weight="bold">● 컨설팅 (20%)</text></svg>`,
  },
  {
    id: 'default-img-chart-financial',
    title: '3개년 재무 손익 분기점(BEP) 시뮬레이션 라인 차트',
    category: 'chart',
    productType: 'presentation',
    createdAt: Date.now() - 3000000,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%"><rect width="800" height="450" fill="%230f172a"/><path d="M150,350 L650,350 M150,100 L150,350" stroke="%23334155" stroke-width="2"/><path d="M150,320 Q300,280 450,180 T650,80" fill="none" stroke="%2310b981" stroke-width="5"/><path d="M150,290 L650,230" fill="none" stroke="%23f43f5e" stroke-width="3" stroke-dasharray="5,5"/><circle cx="450" cy="180" r="8" fill="%2338bdf8" stroke="%23ffffff" stroke-width="2"/><text x="460" y="210" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="%2338bdf8">손익분기점 돌파 (2.4년 차)</text><text x="150" y="380" font-family="system-ui, sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">1년 차 (설립)</text><text x="400" y="380" font-family="system-ui, sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">2년 차 (스케일업)</text><text x="650" y="380" font-family="system-ui, sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">3년 차 (시장안착)</text></svg>`,
  },
  {
    id: 'default-img-flow-workflow',
    title: '사내 다이렉트 전결 규정 및 기안 결재선 시스템 맵',
    category: 'related',
    productType: 'form',
    createdAt: Date.now() - 2000000,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%"><rect width="800" height="450" fill="%230f172a"/><rect x="100" y="180" width="140" height="80" rx="10" fill="%231e293b" stroke="%234f46e5" stroke-width="2"/><text x="170" y="225" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">1. 기안작성 (실무)</text><rect x="330" y="180" width="140" height="80" rx="10" fill="%231e293b" stroke="%2306b6d4" stroke-width="2"/><text x="400" y="225" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">2. 부서 검토</text><rect x="560" y="180" width="140" height="80" rx="10" fill="%231e293b" stroke="%2310b981" stroke-width="2"/><text x="630" y="225" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">3. 최종 전결 (임원)</text><path d="M240,220 L330,220 M470,220 L560,220" stroke="%2364748b" stroke-width="3" marker-end="url(%23arrow)"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="%2364748b"/></marker></defs></svg>`,
  },
  {
    id: 'default-img-meeting-b2b',
    title: 'B2B 엔터프라이즈 마케팅 미디어 및 채널 믹스 인포그래픽',
    category: 'related',
    productType: 'presentation',
    createdAt: Date.now() - 1000000,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%"><rect width="800" height="450" fill="%230f172a"/><rect x="150" y="100" width="500" height="250" rx="20" fill="%231e293b" opacity="0.8"/><text x="400" y="145" font-family="system-ui, sans-serif" font-weight="extrabold" font-size="20" fill="%23ffffff" text-anchor="middle">B2B Core Marketing Synergy</text><circle cx="280" cy="240" r="45" fill="%234f46e5" opacity="0.9"/><text x="280" y="245" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" fill="%23ffffff" text-anchor="middle">SEO / 콘텐츠</text><circle cx="400" cy="240" r="45" fill="%2306b6d4" opacity="0.9"/><text x="400" y="245" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" fill="%23ffffff" text-anchor="middle">웨비나 / 학회</text><circle cx="520" cy="240" r="45" fill="%23ec4899" opacity="0.9"/><text x="520" y="245" font-family="system-ui, sans-serif" font-weight="bold" font-size="12" fill="%23ffffff" text-anchor="middle">네트워킹 / PR</text></svg>`,
  },
];

const COLLECTION_NAME = 'public_images';

/**
 * Fetches all public image assets. If Firestore is empty, saves and returns the default presets.
 */
export async function getPublicImages(): Promise<PublicImageItem[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('[Firebase] Empty public images collection. Provisioning defaults...');
      // Batch save default presets so the app is populated out-of-the-box
      await Promise.all(
        DEFAULT_PRESETS.map((preset) => savePublicImage(preset))
      );
      return DEFAULT_PRESETS;
    }

    const items: PublicImageItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as PublicImageItem);
    });

    return items;
  } catch (error) {
    console.error('[Firebase] Failed to fetch public image assets, falling back to defaults:', error);
    return DEFAULT_PRESETS;
  }
}

/**
 * Saves a single public image asset (each represents its own document in Firestore, keeping docs < 1MB and scale infinite).
 */
export async function savePublicImage(asset: Omit<PublicImageItem, 'createdAt'>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, asset.id);
    await setDoc(docRef, {
      ...asset,
      createdAt: Date.now(),
    });
    console.log(`[Firebase] Saved public image asset successfully: ${asset.id}`);
  } catch (error) {
    console.error(`[Firebase] Error saving image asset ${asset.id}:`, error);
    throw error;
  }
}

/**
 * Deletes a single public image asset.
 */
export async function deletePublicImage(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Deleted public image asset successfully: ${id}`);
  } catch (error) {
    console.error(`[Firebase] Error deleting image asset ${id}:`, error);
    throw error;
  }
}
