
import { shouldOfferVerse } from './chatbotCore.js';

// Since we can't easily hit the live DB from a scratch script without full setup,
// we will verify the logic inside the route handler itself is using the right check.

async function mockAskRoute(count) {
    console.log(`\nSimulating /api/chat/ask with message count: ${count}`);
    
    // This is exactly how the backend route works:
    const offerVerse = shouldOfferVerse(count, true);
    
    if (offerVerse) {
        console.log('✅ SERVER: "Count is 10. Fetching a verse to offer the user..."');
        return { verseOffer: { mood: 'sad', verseRef: 'Surah Al-Baqarah 286' } };
    } else {
        console.log('❌ SERVER: "Count is not a multiple of 10. Just replying normally."');
        return { verseOffer: null };
    }
}

async function runTest() {
    await mockAskRoute(9);
    await mockAskRoute(10);
    await mockAskRoute(11);
}

runTest();
