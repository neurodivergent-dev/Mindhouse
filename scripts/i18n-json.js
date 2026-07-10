const fs = require('fs');
const path = require('path');

const enFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\en.json';
const trFile = 'C:\\Users\\Melih\\Documents\\Projects\\akilhane\\messages\\tr.json';

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const trData = JSON.parse(fs.readFileSync(trFile, 'utf8'));

const enDashboard = {
  "loginRequired": "Login Required",
  "loginToAccess": "You need to log in to access the Dashboard.",
  "login": "Login",
  "title": "Mindhouse Dashboard",
  "welcome": "Welcome",
  "user": "User",
  "guestMode": "Guest Mode",
  "member": "Member",
  "demo": "Demo",
  "analyticsView": "Analytics View",
  "settings": "Settings",
  "demoModeActive": "Demo Mode Active!",
  "demoModeDesc": "This data is prepared for sample usage. You can turn off demo mode to see the real user experience.",
  "guestModeActive": "You are using guest mode.",
  "guestModeDesc1": "Your data is only stored on this device. For permanent storage ",
  "createFreeAccount": "create a free account",
  "guestModeDesc2": " or backup your data.",
  "backup": "Backup",
  "restore": "Restore",
  "storageUsage": "Storage Usage",
  "used": "Used",
  "storageWarning": "Your storage space is almost full. Delete old data or backup.",
  "totalTests": "Total Tests",
  "differentSubjects": "different subjects",
  "averageScore": "Average Score",
  "recentTestsAvg": "Average of recent tests",
  "totalTime": "Total Time",
  "studyTime": "Study time",
  "activeSubjects": "Active Subjects",
  "subjectCount": "Number of subjects you study",
  "subjectPerformance": "Subject-Based Performance",
  "subjectPerformanceDesc": "Track your progress in each subject",
  "testsCompleted": "tests completed",
  "topicsToImprove": "Topics to improve:",
  "others": "others",
  "strongTopics": "Your strong topics:",
  "takeFirstTest": "Take Your First Test",
  "takeFirstTestDesc": "Start tracking your performance by taking tests!",
  "takeTest": "Take Test",
  "performanceTracking": "Performance Tracking",
  "performanceTrackingDesc": "Analyze your test results and see your progress.",
  "seeResults": "See Results",
  "trackProgress": "Track Progress",
  "developmentProcess": "Development Process",
  "developmentProcessDesc": "Improve yourself with every test and reach success.",
  "selectSubject": "Select Subject",
  "watchProgress": "Watch Progress",
  "recentActivities": "Recent Activities",
  "recentActivitiesDesc": "Your recent activities and tests",
  "topicRead": "Topic Explainer Read",
  "testSolved": "Test Solved",
  "correct": "correct",
  "read": "Read",
  "recentActivitiesEmptyDesc": "See your activities and track your progress by taking tests or studying topics!",
  "quickTest": "Quick Test",
  "quickTestDesc": "{count} question quick test",
  "flashcardDesc": "Study with flashcards",
  "aiTutorDesc": "Chat with AI",
  "subjectManagement": "Subject Management",
  "subjectManagementDesc": "Manage subjects",
  "dashboardFeatures": "Dashboard Features",
  "toasts": {
    "guestOnly": "This feature is for guest users only",
    "guestOnlyDesc": "Logged in users can manage their data from profile settings.",
    "exportSuccess": "Data exported successfully",
    "exportSuccessDesc": "Your backup file has been downloaded. Keep it in a safe place.",
    "exportError": "Export Error",
    "exportErrorDesc": "An error occurred while exporting data.",
    "importSuccess": "Data imported successfully",
    "importSuccessDesc": "Your backup data has been restored. Page is reloading...",
    "importError": "Import Error",
    "importErrorDesc": "File format is invalid or corrupted.",
    "demoActive": "Demo Mode Active",
    "demoActiveDesc": "Demo data loaded. Page is reloading...",
    "demoInactive": "Demo mode turned off",
    "demoInactiveDesc": "Demo data cleared. Switched to guest user mode. Page is reloading..."
  }
};

const trDashboard = {
  "loginRequired": "Giriş Gerekli",
  "loginToAccess": "Dashboard'a erişmek için giriş yapmanız gerekiyor.",
  "login": "Giriş Yap",
  "title": "Mindhouse Dashboard",
  "welcome": "Hoş geldiniz",
  "user": "Kullanıcı",
  "guestMode": "Misafir Modu",
  "member": "Üye",
  "demo": "Demo",
  "analyticsView": "Analitik Görünüm",
  "settings": "Ayarlar",
  "demoModeActive": "Demo Modu Aktif!",
  "demoModeDesc": "Bu veriler örnek kullanım için hazırlanmış demo verileridir. Gerçek kullanım deneyimini görmek için demo modunu kapatabilirsiniz.",
  "guestModeActive": "Misafir modunda kullanıyorsunuz.",
  "guestModeDesc1": "Verileriniz sadece bu cihazda saklanıyor. Kalıcı kayıt için ",
  "createFreeAccount": "ücretsiz hesap oluşturun",
  "guestModeDesc2": " veya verilerinizi yedekleyin.",
  "backup": "Yedekle",
  "restore": "Geri Yükle",
  "storageUsage": "Depolama Kullanımı",
  "used": "Kullanılan",
  "storageWarning": "Depolama alanınız dolmak üzere. Eski verileri silin veya yedekleyin.",
  "totalTests": "Toplam Test",
  "differentSubjects": "farklı konuda",
  "averageScore": "Ortalama Başarı",
  "recentTestsAvg": "Son testlerin ortalaması",
  "totalTime": "Toplam Süre",
  "studyTime": "Çalışma süresi",
  "activeSubjects": "Aktif Konular",
  "subjectCount": "Çalıştığınız konu sayısı",
  "subjectPerformance": "Konu Bazlı Performans",
  "subjectPerformanceDesc": "Her konudaki gelişiminizi takip edin",
  "testsCompleted": "test tamamlandı",
  "topicsToImprove": "Geliştirilmesi gereken konular:",
  "others": "diğer",
  "strongTopics": "Güçlü olduğunuz konular:",
  "takeFirstTest": "İlk Testinizi Çözün",
  "takeFirstTestDesc": "Test çözerek performansınızı takip etmeye başlayın!",
  "takeTest": "Test Çöz",
  "performanceTracking": "Performans Takibi",
  "performanceTrackingDesc": "Test sonuçlarınızı analiz edin ve gelişiminizi görün.",
  "seeResults": "Sonuçları Gör",
  "trackProgress": "Gelişimi Takip Et",
  "developmentProcess": "Gelişim Süreci",
  "developmentProcessDesc": "Her test ile kendinizi geliştirin ve başarıya ulaşın.",
  "selectSubject": "Konu Seç",
  "watchProgress": "Gelişimi İzle",
  "recentActivities": "Son Aktiviteler",
  "recentActivitiesDesc": "Son gerçekleştirdiğiniz aktiviteler ve testler",
  "topicRead": "Konu Anlatımı Okundu",
  "testSolved": "Test Çözüldü",
  "correct": "doğru",
  "read": "Okundu",
  "recentActivitiesEmptyDesc": "Test çözerek veya konu çalışarak aktivitelerinizi görün ve gelişiminizi takip edin!",
  "quickTest": "Hızlı Test",
  "quickTestDesc": "{count} soruluk hızlı test çöz",
  "flashcardDesc": "Akıllı kartlarla çalış",
  "aiTutorDesc": "Yapay zeka ile sohbet et",
  "subjectManagement": "Konu Yönetimi",
  "subjectManagementDesc": "Konuları düzenle",
  "dashboardFeatures": "Dashboard Özellikleri",
  "toasts": {
    "guestOnly": "Bu özellik sadece misafir kullanıcılar içindir",
    "guestOnlyDesc": "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
    "exportSuccess": "Veriler başarıyla dışa aktarıldı",
    "exportSuccessDesc": "Yedek dosyanız indirildi. Bu dosyayı güvenli bir yerde saklayın.",
    "exportError": "Dışa aktarma hatası",
    "exportErrorDesc": "Veriler dışa aktarılırken bir hata oluştu.",
    "importSuccess": "Veriler başarıyla içe aktarıldı",
    "importSuccessDesc": "Yedek verileriniz geri yüklendi. Sayfa yenileniyor...",
    "importError": "İçe aktarma hatası",
    "importErrorDesc": "Dosya formatı geçersiz veya bozuk.",
    "demoActive": "Demo Modu Aktif",
    "demoActiveDesc": "Demo veriler yüklendi. Sayfa yenileniyor...",
    "demoInactive": "Demo modu kapatıldı",
    "demoInactiveDesc": "Demo veriler temizlendi. Misafir kullanıcı moduna geçildi. Sayfa yenileniyor..."
  }
};

if (!enData.Dashboard) {
  enData.Dashboard = enDashboard;
} else {
  enData.Dashboard = { ...enData.Dashboard, ...enDashboard };
}

if (!trData.Dashboard) {
  trData.Dashboard = trDashboard;
} else {
  trData.Dashboard = { ...trData.Dashboard, ...trDashboard };
}

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(trFile, JSON.stringify(trData, null, 2), 'utf8');
console.log('JSON updated');
