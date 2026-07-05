const fs = require('fs');
const path = require('path');

const enFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\en.json';
const trFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\tr.json';

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const trData = JSON.parse(fs.readFileSync(trFile, 'utf8'));

enData.AIPerformance.topicsToFocus = "Topics to Focus On";
enData.AIPerformance.estimatedTime = "Estimated time: {time} minutes";
enData.AIPerformance.confidence = "Confidence:";
enData.AIPerformance.goToFlashcards = "Go to Flashcards";
enData.AIPerformance.takeQuiz = "Take Quiz";

trData.AIPerformance.topicsToFocus = "Odaklanılacak Konular";
trData.AIPerformance.estimatedTime = "Tahmini süre: {time} dakika";
trData.AIPerformance.confidence = "Güven:";
trData.AIPerformance.goToFlashcards = "Flashcard'lara Git";
trData.AIPerformance.takeQuiz = "Quiz Çöz";

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(trFile, JSON.stringify(trData, null, 2), 'utf8');
console.log('JSON updated for AIPerformance extra strings');
