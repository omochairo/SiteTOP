const fs = require('fs');
const path = require('path');
const https = require('https');

const RSS_URL = 'https://omcha.jp/feed/';
const OUTPUT_FILE = path.join(__dirname, '../src/data/rss_feed.json');

// Helper to fetch content (follows redirects if needed, simple implementation)
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(`Timeout fetching ${url}`));
        });
    });
}

// Extract og:image from HTML content
function extractOgImage(html) {
    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    return ogMatch ? ogMatch[1] : null;
}

async function updateFeed() {
    try {
        console.log(`Fetching RSS from ${RSS_URL}...`);
        const xml = await fetchUrl(RSS_URL);

        // Parse items
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
            if (items.length >= 10) break; // Limit to 10
            const content = match[1];

            const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
            const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);

            const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : 'No Title';
            const link = linkMatch ? linkMatch[1] : '';

            if (link) {
                items.push({ title, url: link });
            }
        }

        console.log(`Found ${items.length} items. Fetching individual pages for og:image (Deep Inspection)...`);

        // Fetch og:image for each item in parallel
        const enhancedItems = await Promise.all(items.map(async (item) => {
            try {
                console.log(`Fetching page: ${item.title.substring(0, 20)}...`);
                const html = await fetchUrl(item.url);
                let image = extractOgImage(html);

                if (image) {
                    console.log(`  Found og:image: ${image.substring(image.lastIndexOf('/') + 1)}`);
                } else {
                    console.log(`  No og:image found, using placeholder.`);
                    image = 'https://picsum.photos/400/260?blur=2';
                }

                // Clean up image URL if needed (remove query params)
                if (image) {
                    // Common WordPress high-res fix
                    image = image.replace(/-320x180(\.[a-z]+)$/i, '$1');
                }

                return {
                    ...item,
                    image
                };
            } catch (err) {
                console.error(`  Failed to fetch ${item.url}: ${err.message}`);
                return {
                    ...item,
                    image: 'https://picsum.photos/400/260?blur=2' // Fallback
                };
            }
        }));

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhancedItems, null, 2));
        console.log(`Updated ${OUTPUT_FILE} with ${enhancedItems.length} items.`);

    } catch (error) {
        console.error('Failed to update feed:', error);
        process.exit(1);
    }
}

updateFeed();
