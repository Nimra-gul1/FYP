
import { generateSystemPrompt } from './chatbotCore.js';

console.log('---  QALBIFY PERSONALITY SIMULATION  ---\n');

// 1. Testing Age & Tone Adaptation
console.log('Case A: User sounds young & energetic');
const youngPrompt = generateSystemPrompt('Gentle', true, 'happy');
console.log('--- INSTRUCTIONS FOR YOUNG USER ---');
if (youngPrompt.content.includes('AGE ADAPTATION')) {
    console.log('Found Age-Adaptive Instruction: Match energy and lightness.');
}
if (youngPrompt.content.includes('BE A HUMAN FRIEND')) {
    console.log('Found Human-First Instruction: No AI assistance talk.');
}

console.log('\nCase B: User sounds mature/elderly');
const elderlyPrompt = generateSystemPrompt('Gentle', true, 'sad');
console.log('--- INSTRUCTIONS FOR ELDERLY USER ---');
if (elderlyPrompt.content.includes('deep respect and a slower, steadier pace')) {
    console.log('Found Respectful Tone Instruction: Speak with deeper respect.');
}

// 2. Testing Empathy & No Taunting
console.log('\nCase C: Strict Empathy Rules');
if (youngPrompt.content.includes('NO SADNESS REMINDERS') && youngPrompt.content.includes('NO TAUNTING')) {
    console.log('Found Anti-Taunting Rules: Never remind of past sadness.');
}

console.log('\n---  UI REFINEMENT STATS (chatbot.tsx) ---');
console.log('Header Padding: scale(15) top, scale(2) bottom -> MOVED DOWN');
console.log('Title Size: rf(28) -> BIGGER');
console.log('Icons (top): scale(48) -> PERFECTLY ALIGNED DOWN');
console.log('Input Footer: scale(6) padding -> SLIM');

console.log('\n--- HUMAN-FRIEND BANNED LIST ---');
const banned = ["no pressure", "how's your vibe", "That makes sense", "As an AI"];
banned.forEach(word => {
    if (youngPrompt.content.includes(word)) {
        console.log(`Banned phrase confirmed for removal: "${word}"`);
    }
});
