const fs = require('fs');

let content = fs.readFileSync('src/services/unified-storage-service.ts', 'utf-8');

// Add localforage import
content = content.replace(
  'import { createClient } from "@supabase/supabase-js";',
  'import { createClient } from "@supabase/supabase-js";\nimport localforage from "localforage";'
);

const methodsToMakeAsync = [
  'getQuestions', 'saveQuestions', 'addQuestion', 'updateQuestion', 'deleteQuestion', 'getQuestionsBySubject',
  'getSubjects', 'saveSubjects', 'addSubject', 'updateSubject', 'deleteSubject',
  'getFlashcards', 'saveFlashcards', 'addFlashcard', 'updateFlashcard', 'deleteFlashcard', 'getFlashcardsBySubject', 'updateFlashcardProgress',
  'getSavedTopics', 'saveTopic', 'updateTopic', 'deleteTopic', 'getTopicById', 'getTopicsBySubject', 'getTopicsByTopic', 'clearTopicsBySubject', 'saveTopicsBySubject'
];

methodsToMakeAsync.forEach(method => {
  // Replace: static method(args): ReturnType -> static async method(args): Promise<ReturnType>
  // This regex matches `static method(` and anything until `) {` or `): ReturnType {`
  // Actually, let's just do a string replacement for the exact signatures we know, or use a regex for the return type.
  const signatureRegex = new RegExp(`static ${method}\\((.*?)\\):\\s*([a-zA-Z\\[\\]<>{}\\s]+)\\s*\\{`, 'g');
  content = content.replace(signatureRegex, (match, args, returnType) => {
    // If it's already a Promise, don't wrap it again
    if (returnType.trim().startsWith('Promise<')) {
      return `static async ${method}(${args}): ${returnType} {`;
    }
    return `static async ${method}(${args}): Promise<${returnType.trim()}> {`;
  });
  
  // Private static methods
  const privSignatureRegex = new RegExp(`private static ${method}\\((.*?)\\):\\s*([a-zA-Z\\[\\]<>{}\\s]+)\\s*\\{`, 'g');
  content = content.replace(privSignatureRegex, (match, args, returnType) => {
    if (returnType.trim().startsWith('Promise<')) {
      return `private static async ${method}(${args}): ${returnType} {`;
    }
    return `private static async ${method}(${args}): Promise<${returnType.trim()}> {`;
  });
});

// Some methods might not have explicit return types in the regex matching, let's also just replace static method( if missed.
methodsToMakeAsync.forEach(method => {
  const fallbackRegex = new RegExp(`static ${method}\\(`, 'g');
  content = content.replace(fallbackRegex, `static async ${method}(`);
});
// Remove double asyncs just in case
content = content.replace(/static async async/g, 'static async');

// Update localStorage calls
content = content.replace(/localStorage\.getItem\(/g, 'await localforage.getItem(');
content = content.replace(/localStorage\.setItem\(/g, 'await localforage.setItem(');
content = content.replace(/localStorage\.removeItem\(/g, 'await localforage.removeItem(');

// Add awaits to internal calls
methodsToMakeAsync.forEach(method => {
  const regex = new RegExp(`this\\.${method}\\(`, 'g');
  content = content.replace(regex, `await this.${method}(`);
});

// Specific internal class calls
content = content.replace(/UnifiedStorageService\.getQuestions/g, 'await UnifiedStorageService.getQuestions');
content = content.replace(/UnifiedStorageService\.getSubjects/g, 'await UnifiedStorageService.getSubjects');
content = content.replace(/UnifiedStorageService\.getFlashcards/g, 'await UnifiedStorageService.getFlashcards');

fs.writeFileSync('src/services/unified-storage-service.ts', content);
console.log("Refactoring complete");
