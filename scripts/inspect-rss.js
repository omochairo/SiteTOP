import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RSS_URL = 'https://omcha.jp/feed/';

async function inspectFeed() {
    try {
        console.log(`Fetching ${RSS_URL}...`);
        const response = await fetch(RSS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();

        console.log("--- FEED CONTENT PREVIEW (First 2000 chars) ---");
        console.log(text.substring(0, 2000));
        console.log("-----------------------------------------------");

        // Check for image indicators
        const hasMedia = text.includes('media:content');
        const hasEnclosure = text.includes('enclosure');
        const hasContentEncoded = text.includes('content:encoded');

        console.log(`Contains media:content? ${hasMedia}`);
        console.log(`Contains enclosure? ${hasEnclosure}`);
        console.log(`Contains content:encoded? ${hasContentEncoded}`);

        // Try to extract an image URL using regex from the first item
        const firstItemMatch = text.match(/<item>([\s\S]*?)<\/item>/);
        if (firstItemMatch) {
            const itemContent = firstItemMatch[1];
            console.log("\n--- FIRST ITEM CONTENT ---");
            console.log(itemContent.substring(0, 500) + "...");

            const imgMatch = itemContent.match(/<img[^>]+src="([^">]+)"/);
            console.log(`\nExtracted Image from correct content: ${imgMatch ? imgMatch[1] : 'None'}`);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

inspectFeed();
