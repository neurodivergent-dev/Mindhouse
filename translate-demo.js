const fs = require('fs');
let content = fs.readFileSync('src/data/demo-data.ts', 'utf8');

const translations = `
const tMap: Record<string, string> = {
  'f(x) = 2x + 3 fonksiyonunun f(5) değeri kaçtır?': 'What is the value of f(5) for the function f(x) = 2x + 3?',
  'Bir üçgenin iç açıları toplamı kaç derecedir?': 'What is the sum of the interior angles of a triangle?',
  '∫(2x + 1)dx integralinin sonucu nedir?': 'What is the result of the integral ∫(2x + 1)dx?',
  'Newton\\'un ikinci yasası hangi formülle ifade edilir?': 'What formula expresses Newton\\'s second law?',
  'Işığın boşluktaki hızı yaklaşık kaç m/s\\'dir?': 'What is the approximate speed of light in a vacuum in m/s?',
  'Termodinamiğin birinci yasası hangi kavramı ifade eder?': 'What concept does the first law of thermodynamics express?',
  'Periyodik tabloda 1. grupta bulunan elementler hangi isimle bilinir?': 'What are the elements in group 1 of the periodic table called?',
  'H₂O molekülünün geometrik şekli nedir?': 'What is the geometric shape of the H₂O molecule?',
  'pH değeri 2 olan bir çözelti nasıldır?': 'What is a solution with a pH of 2?',
  'Fotosentez hangi organellerde gerçekleşir?': 'In which organelles does photosynthesis occur?',
  'İnsan vücudundaki en uzun kemik hangisidir?': 'What is the longest bone in the human body?',
  'DNA\\'nın yapısını ilk kez kim keşfetmiştir?': 'Who first discovered the structure of DNA?',
  'Osmanlı İmparatorluğu hangi yılda kurulmuştur?': 'In what year was the Ottoman Empire founded?',
  'Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?': 'On what date was the Republic of Turkey proclaimed?',
  'Fransız İhtilali hangi yılda başlamıştır?': 'In what year did the French Revolution begin?',
  '"Kırmızı Saçlı Kadın" romanının yazarı kimdir?': 'Who is the author of the novel "The Red-Haired Woman"?',
  'Divan Edebiyatı\\'nın en önemli nazım şekli hangisidir?': 'What is the most important verse form in Divan Literature?',
  'Aşağıdakilerden hangisi bir edebi akım değildir?': 'Which of the following is not a literary movement?',
  'Which sentence is grammatically correct?': 'Which sentence is grammatically correct?',
  'What is the past tense of "go"?': 'What is the past tense of "go"?',
  'Choose the correct synonym for "happy".': 'Choose the correct synonym for "happy".',
  'fonksiyon': 'function',
  'cebir': 'algebra',
  'geometri': 'geometry',
  'üçgen': 'triangle',
  'integral': 'integral',
  'analiz': 'calculus',
  'newton': 'newton',
  'kuvvet': 'force',
  'mekanik': 'mechanics',
  'ışık': 'light',
  'hız': 'speed',
  'optik': 'optics',
  'termodinamik': 'thermodynamics',
  'enerji': 'energy',
  'korunum': 'conservation',
  'periyodik tablo': 'periodic table',
  'alkali metaller': 'alkali metals',
  'molekül geometrisi': 'molecular geometry',
  'bağlar': 'bonds',
  'asitler ve bazlar': 'acids and bases',
  'ph': 'ph',
  'fotosentez': 'photosynthesis',
  'hücre': 'cell',
  'anatomi': 'anatomy',
  'iskelet': 'skeleton',
  'genetik': 'genetics',
  'dna': 'dna',
  'osmanlı': 'ottoman',
  'kuruluş': 'foundation',
  'türkiye': 'turkey',
  'cumhuriyet': 'republic',
  'avrupa tarihi': 'european history',
  'ihtilal': 'revolution',
  'türk edebiyatı': 'turkish literature',
  'roman': 'novel',
  'divan edebiyatı': 'divan literature',
  'şiir': 'poetry',
  'edebi akımlar': 'literary movements',
  'teori': 'theory',
  'grammar': 'grammar',
  'tenses': 'tenses',
  'vocabulary': 'vocabulary',
  'synonyms': 'synonyms'
};

export const translateDemoData = (data: any, locale?: string) => {
  if (locale !== "en" || !data) return data;
  if (Array.isArray(data)) return data.map(item => translateDemoData(item, locale));
  if (typeof data === "object") {
    const translated = { ...data };
    if (translated.question && tMap[translated.question]) {
      translated.question = tMap[translated.question];
    }
    if (translated.tags && Array.isArray(translated.tags)) {
      translated.tags = translated.tags.map((tag: string) => tMap[tag] || tag);
    }
    if (translated.topic && typeof translated.topic === "string" && tMap[translated.topic.toLowerCase()]) {
      translated.topic = tMap[translated.topic.toLowerCase()];
    }
    return translated;
  }
  return data;
};
`;

if (!content.includes('translateDemoData')) {
  content = content.replace('export const getDemoQuestions = (subjectNameOrId: string) => {', translations + '\nexport const getDemoQuestions = (subjectNameOrId: string, locale?: string) => {');
  
  // also modify getDemoQuestions return
  content = content.replace(
    'return demoQuestions[subjectId as keyof typeof demoQuestions] || [];',
    'return translateDemoData(demoQuestions[subjectId as keyof typeof demoQuestions] || [], locale);'
  );

  content = content.replace(
    'export const getAllDemoQuestions = () => Object.values(demoQuestions).flat();',
    'export const getAllDemoQuestions = (locale?: string) => translateDemoData(Object.values(demoQuestions).flat(), locale);'
  );

  fs.writeFileSync('src/data/demo-data.ts', content);
}
