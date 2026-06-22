
import { shouldOfferVerse, VERSE_TRIGGER } from './chatbotCore.js';

console.log('--- Testing Verse Trigger Logic ---');
console.log(`Rules: Start after ${VERSE_TRIGGER.MINIMUM_MESSAGES} msgs, then every ${VERSE_TRIGGER.EVERY_N_MESSAGES} msgs.`);

const testCases = [1, 5, 9, 10, 11, 19, 20, 25, 30];
testCases.forEach(count => {
    const trigger = shouldOfferVerse(count, true);
    console.log(`Message Count: ${count.toString().padStart(2)} -> Should Trigger: ${trigger ? '✅ YES' : '❌ NO'}`);
});

if (shouldOfferVerse(10, true) && !shouldOfferVerse(9, true) && shouldOfferVerse(20, true)) {
    console.log('\nSUCCESS: Logic is perfect (10, 20, 30...).');
} else {
    console.log('\nFAILURE: Logic mismatch.');
}
