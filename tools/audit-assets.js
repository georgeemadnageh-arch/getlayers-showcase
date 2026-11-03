const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data.js');
const rawCode = fs.readFileSync(dataFilePath, 'utf8');

const window = {};
eval(rawCode);

const items = window.GETLAYERS_DATA;
console.log(`Loaded ${items.length} items from data.js`);

// Helper to check URL with retries
async function checkUrl(url, maxRetries = 3) {
  if (!url) return { ok: false, error: 'Empty URL' };
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const contentLength = res.headers.get('content-length');
      const contentType = res.headers.get('content-type');
      return {
        ok: res.ok,
        status: res.status,
        contentLength: contentLength ? parseInt(contentLength, 10) : null,
        contentType: contentType || null,
        cfCache: res.headers.get('cf-cache-status')
      };
    } catch (err) {
      if (attempt === maxRetries) {
        return { ok: false, error: err.message };
      }
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

// Concurrency queue
async function mapConcurrent(array, concurrency, fn) {
  const results = new Array(array.length);
  let index = 0;
  
  async function worker() {
    while (index < array.length) {
      const i = index++;
      results[i] = await fn(array[i], i);
    }
  }

  const workers = [];
  for (let c = 0; c < concurrency; c++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

async function runAudit() {
  const startTime = Date.now();
  console.log(`Starting asset audit with concurrency 30...`);

  let completed = 0;
  const total = items.length;

  const auditedItems = await mapConcurrent(items, 30, async (item, idx) => {
    const isStatic = !item.posterVideo && !item.previewVideo;
    
    let posterAudit = null;
    let previewAudit = null;
    let imageAudit = null;

    if (item.posterVideo) {
      posterAudit = await checkUrl(item.posterVideo);
    }
    if (item.previewVideo) {
      previewAudit = await checkUrl(item.previewVideo);
    }
    if (isStatic && (item.previewImage || item.image)) {
      imageAudit = await checkUrl(item.previewImage || item.image);
    }

    completed++;
    if (completed % 100 === 0 || completed === total) {
      process.stdout.write(`Progress: ${completed}/${total} items audited...\n`);
    }

    return {
      index: idx,
      id: item.id,
      title: item.title,
      category: item.category,
      categoryType: item.categoryType,
      isStatic,
      posterVideo: item.posterVideo || null,
      posterVideoAudit: posterAudit,
      previewVideo: item.previewVideo || null,
      previewVideoAudit: previewAudit,
      image: item.image || null,
      imageAudit: imageAudit
    };
  });

  console.log(`\nAudit completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

  // Analyze Results
  const brokenPosterVideos = [];
  const brokenPreviewVideos = [];
  const brokenStaticImages = [];
  const verifiedVideoAssets = [];
  const verifiedStaticAssets = [];

  const categoryStats = {};

  for (const item of auditedItems) {
    const cat = item.category || 'unknown';
    if (!categoryStats[cat]) {
      categoryStats[cat] = {
        total: 0,
        videoCount: 0,
        staticCount: 0,
        totalPosterBytes: 0,
        posterSizes: [],
        brokenVideos: 0
      };
    }
    const catStat = categoryStats[cat];
    catStat.total++;

    if (item.isStatic) {
      catStat.staticCount++;
      if (item.imageAudit && item.imageAudit.ok) {
        verifiedStaticAssets.push({
          id: item.id,
          title: item.title,
          category: item.category,
          image: item.image,
          contentLength: item.imageAudit.contentLength,
          contentType: item.imageAudit.contentType
        });
      } else {
        brokenStaticImages.push(item);
      }
    } else {
      catStat.videoCount++;
      if (item.posterVideoAudit && item.posterVideoAudit.ok) {
        catStat.totalPosterBytes += (item.posterVideoAudit.contentLength || 0);
        catStat.posterSizes.push(item.posterVideoAudit.contentLength || 0);
        verifiedVideoAssets.push({
          id: item.id,
          title: item.title,
          category: item.category,
          posterVideo: item.posterVideo,
          posterContentLength: item.posterVideoAudit.contentLength,
          posterContentType: item.posterVideoAudit.contentType,
          previewVideo: item.previewVideo,
          previewContentLength: item.previewVideoAudit ? item.previewVideoAudit.contentLength : null
        });
      } else {
        catStat.brokenVideos++;
        brokenPosterVideos.push(item);
      }

      if (item.previewVideo && (!item.previewVideoAudit || !item.previewVideoAudit.ok)) {
        brokenPreviewVideos.push(item);
      }
    }
  }

  // Calculate detailed category summaries
  const categorySummary = {};
  for (const [cat, s] of Object.entries(categoryStats)) {
    s.posterSizes.sort((a, b) => a - b);
    const count = s.posterSizes.length;
    const minSize = count > 0 ? s.posterSizes[0] : 0;
    const maxSize = count > 0 ? s.posterSizes[count - 1] : 0;
    const medianSize = count > 0 ? s.posterSizes[Math.floor(count / 2)] : 0;
    const avgSize = count > 0 ? Math.round(s.totalPosterBytes / count) : 0;

    categorySummary[cat] = {
      totalItems: s.total,
      videoItems: s.videoCount,
      staticItems: s.staticCount,
      totalPosterBytes: s.totalPosterBytes,
      totalPosterMB: (s.totalPosterBytes / (1024 * 1024)).toFixed(2),
      avgPosterMB: (avgSize / (1024 * 1024)).toFixed(2),
      medianPosterMB: (medianSize / (1024 * 1024)).toFixed(2),
      minPosterMB: (minSize / (1024 * 1024)).toFixed(2),
      maxPosterMB: (maxSize / (1024 * 1024)).toFixed(2),
      brokenVideos: s.brokenVideos
    };
  }

  const overallTotalPosterBytes = verifiedVideoAssets.reduce((acc, v) => acc + (v.posterContentLength || 0), 0);
  const overallTotalPreviewBytes = verifiedVideoAssets.reduce((acc, v) => acc + (v.previewContentLength || 0), 0);

  const report = {
    auditTimestamp: new Date().toISOString(),
    durationSeconds: parseFloat(((Date.now() - startTime) / 1000).toFixed(2)),
    totals: {
      totalItems: items.length,
      videoAssetsVerified: verifiedVideoAssets.length,
      staticAssetsVerified: verifiedStaticAssets.length,
      brokenPosterVideos: brokenPosterVideos.length,
      brokenPreviewVideos: brokenPreviewVideos.length,
      brokenStaticImages: brokenStaticImages.length,
      totalPosterStorageBytes: overallTotalPosterBytes,
      totalPosterStorageGB: (overallTotalPosterBytes / (1024 * 1024 * 1024)).toFixed(3),
      totalPreviewStorageBytes: overallTotalPreviewBytes,
      totalPreviewStorageGB: (overallTotalPreviewBytes / (1024 * 1024 * 1024)).toFixed(3),
      sizeRatioPosterOverPreview: overallTotalPreviewBytes > 0 ? (overallTotalPosterBytes / overallTotalPreviewBytes).toFixed(2) + 'x' : null
    },
    categorySummary,
    brokenAssets: {
      brokenPosterVideos,
      brokenPreviewVideos,
      brokenStaticImages
    },
    staticAssets: verifiedStaticAssets,
    allVerifiedVideoAssetsCount: verifiedVideoAssets.length,
    verifiedVideoAssets: verifiedVideoAssets
  };

  const reportPath = path.join(__dirname, '..', 'assets-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Saved full report to ${reportPath}`);

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total Items Audited: ${report.totals.totalItems}`);
  console.log(`Verified Video Assets: ${report.totals.videoAssetsVerified}`);
  console.log(`Verified Static Assets: ${report.totals.staticAssetsVerified}`);
  console.log(`Broken Poster Videos: ${report.totals.brokenPosterVideos}`);
  console.log(`Broken Preview Videos: ${report.totals.brokenPreviewVideos}`);
  console.log(`Broken Static Images: ${report.totals.brokenStaticImages}`);
  console.log(`Total Poster Video Size: ${report.totals.totalPosterStorageGB} GB (${report.totals.totalPosterStorageBytes.toLocaleString()} bytes)`);
  console.log(`Total Preview Video Size: ${report.totals.totalPreviewStorageGB} GB (${report.totals.totalPreviewStorageBytes.toLocaleString()} bytes)`);
  console.log(`Quality/Size Factor: Poster loops are ${report.totals.sizeRatioPosterOverPreview} the size of preview clips`);
  console.log('\n--- BY CATEGORY ---');
  for (const [cat, sum] of Object.entries(categorySummary)) {
    console.log(`[${cat.toUpperCase()}]: ${sum.videoItems} videos, ${sum.staticItems} static | Total: ${sum.totalPosterMB} MB | Avg: ${sum.avgPosterMB} MB | Min: ${sum.minPosterMB} MB | Max: ${sum.maxPosterMB} MB | Broken: ${sum.brokenVideos}`);
  }

  console.log('\n--- STATIC POSTER ITEMS (16) ---');
  verifiedStaticAssets.forEach((s, i) => {
    console.log(`${i+1}. [${s.id}] ${s.title} (${(s.contentLength / 1024).toFixed(1)} KB) -> ${s.image}`);
  });
}

runAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
