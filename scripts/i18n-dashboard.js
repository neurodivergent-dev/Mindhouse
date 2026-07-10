const fs = require("fs");
const path = require("path");

const file =
  "C:\\Users\\Melih\\Documents\\Projects\\akilhane\\src\\components\\enhanced-dashboard.tsx";
let content = fs.readFileSync(file, "utf8");

const replacements = [
  // Imports
  [
    'import { Switch } from "@/components/ui/switch";',
    'import { Switch } from "@/components/ui/switch";\nimport { useTranslations } from "next-intl";',
  ],

  // Hook definition
  [
    "export default function EnhancedDashboard() {",
    'export default function EnhancedDashboard() {\n  const t = useTranslations("Dashboard");',
  ],

  // Toasts
  ['"Bu özellik sadece misafir kullanıcılar içindir"', 't("toasts.guestOnly")'],
  [
    '"Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir."',
    't("toasts.guestOnlyDesc")',
  ],
  ['"Veriler başarıyla dışa aktarıldı"', 't("toasts.exportSuccess")'],
  [
    '"Yedek dosyanız indirildi. Bu dosyayı güvenli bir yerde saklayın."',
    't("toasts.exportSuccessDesc")',
  ],
  ['"Dışa aktarma hatası"', 't("toasts.exportError")'],
  ['"Veriler dışa aktarılırken bir hata oluştu."', 't("toasts.exportErrorDesc")'],
  ['"Veriler başarıyla içe aktarıldı"', 't("toasts.importSuccess")'],
  ['"Yedek verileriniz geri yüklendi. Sayfa yenileniyor..."', 't("toasts.importSuccessDesc")'],
  ['"İçe aktarma hatası"', 't("toasts.importError")'],
  ['"Dosya formatı geçersiz veya bozuk."', 't("toasts.importErrorDesc")'],
  ['"Demo Modu Aktif"', 't("toasts.demoActive")'],
  ['"Demo veriler yüklendi. Sayfa yenileniyor..."', 't("toasts.demoActiveDesc")'],
  ['"Demo modu kapatıldı"', 't("toasts.demoInactive")'],
  [
    '"Demo veriler temizlendi. Misafir kullanıcı moduna geçildi. Sayfa yenileniyor..."',
    't("toasts.demoInactiveDesc")',
  ],

  // JSX texts
  ["<CardTitle>Giriş Gerekli</CardTitle>", '<CardTitle>{t("loginRequired")}</CardTitle>'],
  ["Dashboard&apos;a erişmek için giriş yapmanız gerekiyor.", '{t("loginToAccess")}'],
  [
    '<Button className="w-full">Giriş Yap</Button>',
    '<Button className="w-full">{t("login")}</Button>',
  ],

  ["Mindhouse Dashboard", '{t("title")}'],
  ['Hoş geldiniz,{" "}', '{t("welcome")}, '],
  ['"Kullanıcı"', 't("user")'],
  ["Misafir Modu", '{t("guestMode")}'],
  ["Üye", '{t("member")}'],

  [">Demo<", '>{t("demo")}<'],
  ["Analitik Görünüm", '{t("analyticsView")}'],
  ["Ayarlar", '{t("settings")}'],

  [
    '<strong className="text-gray-800 dark:text-white">Demo Modu Aktif!</strong>',
    '<strong className="text-gray-800 dark:text-white">{t("demoModeActive")}</strong>',
  ],
  [
    "Bu veriler\\n                  örnek kullanım için hazırlanmış demo verileridir. Gerçek kullanım\\n                  deneyimini görmek için demo modunu kapatabilirsiniz.",
    '{t("demoModeDesc")}',
  ],

  [
    '<strong className="text-gray-800 dark:text-white">\\n                    Misafir modunda kullanıyorsunuz.\\n                  </strong>',
    '<strong className="text-gray-800 dark:text-white">\\n                    {t("guestModeActive")}\\n                  </strong>',
  ],
  ['Verileriniz sadece bu cihazda saklanıyor. Kalıcı kayıt için{" "}', '{t("guestModeDesc1")} '],
  ["ücretsiz hesap oluşturun", '{t("createFreeAccount")}'],
  ["veya verilerinizi yedekleyin.", '{t("guestModeDesc2")}'],

  [">Yedekle<", '>{t("backup")}<'],
  [">Geri Yükle<", '>{t("restore")}<'],

  ["Depolama Kullanımı", '{t("storageUsage")}'],
  ["Kullanılan:", '{t("used")}:'],
  [
    "Depolama alanınız dolmak üzere. Eski verileri silin veya\\n                      yedekleyin.",
    '{t("storageWarning")}',
  ],

  ["Toplam Test", '{t("totalTests")}'],
  ["farklı konuda", '{t("differentSubjects")}'],
  ["Ortalama Başarı", '{t("averageScore")}'],
  ["Son testlerin ortalaması", '{t("recentTestsAvg")}'],
  ["Toplam Süre", '{t("totalTime")}'],
  ["Çalışma süresi", '{t("studyTime")}'],
  ["Aktif Konular", '{t("activeSubjects")}'],
  ["Çalıştığınız konu sayısı", '{t("subjectCount")}'],

  ["Konu Bazlı Performans", '{t("subjectPerformance")}'],
  ["Her konudaki gelişiminizi takip edin", '{t("subjectPerformanceDesc")}'],
  ["test tamamlandı", '{t("testsCompleted")}'],
  ["Geliştirilmesi gereken konular:", '{t("topicsToImprove")}'],
  ["diğer", '{t("others")}'],
  ["Güçlü olduğunuz konular:", '{t("strongTopics")}'],

  ["İlk Testinizi Çözün", '{t("takeFirstTest")}'],
  ["Test çözerek performansınızı takip etmeye başlayın!", '{t("takeFirstTestDesc")}'],
  [">Test Çöz<", '>{t("takeTest")}<'],
  [">Test Çöz<", '>{t("takeTest")}<'], // second instance
  [">Test Çöz<", '>{t("takeTest")}<'], // third instance

  ["Performans Takibi", '{t("performanceTracking")}'],
  ["Test sonuçlarınızı analiz edin ve gelişiminizi görün.", '{t("performanceTrackingDesc")}'],
  ["Sonuçları Gör", '{t("seeResults")}'],
  ["Gelişimi Takip Et", '{t("trackProgress")}'],

  ["Gelişim Süreci", '{t("developmentProcess")}'],
  ["Her test ile kendinizi geliştirin ve başarıya ulaşın.", '{t("developmentProcessDesc")}'],
  ["Konu Seç", '{t("selectSubject")}'],
  ["Gelişimi İzle", '{t("watchProgress")}'],

  ["Son Aktiviteler", '{t("recentActivities")}'],
  ["Son gerçekleştirdiğiniz aktiviteler ve testler", '{t("recentActivitiesDesc")}'],

  [
    'result.type === "TopicExplainer" ? "Konu Anlatımı Okundu" : "Test Çözüldü"',
    'result.type === "TopicExplainer" ? t("topicRead") : t("testSolved")',
  ],
  ['doğru •{" "}', '{t("correct")} •{" "}'],
  [">Okundu<", '>{t("read")}<'],

  [
    "Test çözerek veya konu çalışarak aktivitelerinizi görün ve gelişiminizi takip edin!",
    '{t("recentActivitiesEmptyDesc")}',
  ],

  ["Hızlı Test", '{t("quickTest")}'],
  ["soruluk hızlı test çöz", '{t("quickTestDesc")}'],
  ["Akıllı kartlarla çalış", '{t("flashcardDesc")}'],
  ["Yapay zeka ile sohbet et", '{t("aiTutorDesc")}'],
  ["Konu Yönetimi", '{t("subjectManagement")}'],
  ["Konuları düzenle", '{t("subjectManagementDesc")}'],

  ['title="Dashboard Özellikleri"', 'title={t("dashboardFeatures")}'],
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, "utf8");
console.log("Script completed");
