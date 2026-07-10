## **QualityCheck.txt - Manuel Test Listesi:**

### **🌐 Temel Erişim Testleri:**

**✅ Canlı Site Testi:**

- [x] `https://mindhouse.vercel.app/landing` erişilebilir mi?
- [x] Sayfa yükleniyor mu?
- [x] Responsive design çalışıyor mu?
- [x] Dark/Light mode çalışıyor mu?

### **📚 Ders Ekleme Testleri:**

**Ders Yönetimi:**

- [x] Yeni ders ekleniyor mu?
- [x] LocalStorage kaydediliyor mu?
- [x] Ders güncellenebiliyor mu?
- [x] Aktif/Pasif hale getirilebiliyor mu?
- [x] Ders silinebiliyor mu?
- [x] Ders listesi görüntüleniyor mu?
- [-] Ders silerken doğrulama alınıyor mu?
- [x] Soru yönetici butonu çalışır mu?

**Form Validasyonu:**

- [x] Boş ders adı kabul edilmiyor mu?
- [-] Çok uzun ders adı uyarısı veriyor mu?
- [-] Özel karakterler kontrol ediliyor mu?
- [-] Duplicate ders adı kontrolü var mı?

**UI/UX Testleri:**

- [x] Ders ekleme formu responsive mi?
- [x] Loading state gösteriliyor mu?
- [x] Success/Error mesajları çıkıyor mu?
- [x] Form temizleniyor mu?

### **👤 Profil Yönetimi Testleri:**

**Kullanıcı Profili:**

- [x] Kullanıcı ismini değiştirebiliyor mu?
- [?] Kullanıcı profil resmini değiştirebiliyor mu?
- [?] Kullanıcı şifresini değiştirebiliyor mu?
- [x] Profil bilgileri kaydediliyor mu?
- [x] Profil sayfası responsive mi?

**Avatar Yönetimi:**

- [x] Avatar yükleme çalışıyor mu?
- [x] Avatar silme çalışıyor mu?
- [-] Avatar çemberi resmi ölçekliyor mu?
- [-] Avatar boyutlandırma çalışıyor mu?
- [-] Avatar format kontrolü var mı?

**Şifre Değiştirme:**

- [x] Şifre değiştirme sayfası çalışıyor mu?
- [?] Eski şifre doğrulaması var mı?
  (var ama yanlış şifre girilse bile şifre başarıyla değiştirildi diyor?)

- [x] Yeni şifre validasyonu var mı?
- [?] Şifre güvenlik kontrolü var mı?

### **🤖 AI Özellikleri Testleri:**

**AI Soru Üretimi:**

- [x] Soru üretme butonu çalışıyor mu?
- [-] AI soru üretirken loading oyunu çıkıyor mu?
- [x] Üretilen sorular kaliteli mi?
- [x] Soru seçenekleri mantıklı mı?

**AI Tutor:**

- [x] AI chat çalışıyor mu?
- [x] Cevaplar doğru mu?
- [x] Açıklamalar yeterli mi?

### **🎮 Breakout Loading Game Testleri:**

**Oyun Fonksiyonları:**

- [x] Oyun başlıyor mu?
- [x] Paddle kontrolü çalışıyor mu?
- [x] Top fiziği doğru mu?
- [x] Skor sistemi çalışıyor mu?
- [x] Can sistemi çalışıyor mu?

**Mobil Uyumluluk:**

- [x] Mobil dokunmatik kontroller çalışıyor mu?
- [x] Oyun mobilde responsive mi?

### **📱 PWA Testleri:**

**PWA Özellikleri:**

- [x] PWA install prompt çıkıyor mu?
- [-] Offline çalışıyor mu?
- [x] App-like deneyim var mı?

### **🔐 Authentication Testleri:**

**Kullanıcı Girişi:**

- [x] Login sayfası çalışıyor mu?
- [x] Google ile giriş çalışıyor mu?
- [x] Register işlemi çalışıyor mu?
- [x] Password reset çalışıyor mu?

### **Analytics Testleri:**

**Dashboard:**

- [x] Analytics dashboard yükleniyor mu?
- [x] Grafikler görünüyor mu?
- [?] Veriler doğru mu?

### **⚙️ Ayarlar Testleri:**

**Görünüm Ayarları:**

- [x] Tema ayarı çalışıyor mu? (System/Koyu/Açık)
- [x] Yazı boyutu değişiyor mu? (Küçük/Orta/Büyük)
- [x] Kompakt mod switch çalışıyor mu?
- [x] Ayarları kaydet butonu çalışıyor mu?
- [x] Ayarlar kaydediliyor mu?
- [x] Sayfa yenilendiğinde ayarlar korunuyor mu?

**Çalışma Tercihleri:**

- [x] Varsayılan ders dropdown çalışıyor mu?
- [x] Test başına soru sayısı değişiyor mu? (5/10/15/20/Özel)
- [x] Zaman limiti ayarlanabiliyor mu? (15/30/45/60/Özel)
- [x] Zamanlayıcı göster switch çalışıyor mu?
- [x] Otomatik gönder switch çalışıyor mu?

**Bildirimler:**

- [x] Bildirimler "yakında" mesajı gösteriyor mu?
- [x] Bildirim ayarları sayfası erişilebilir mi?

**UI/UX Testleri:**

- [x] Ayarlar sayfası responsive mi?
- [x] Switch'ler animasyonlu mu?
- [x] Dropdown'lar düzgün çalışıyor mu?
- [x] Ayarlar kategorileri organize mi?

### **💾 Veri Yönetimi Testleri:**

**Veri Dışa Aktarma:**

- [x] Verileri dışa aktar butonu çalışıyor mu?
- [x] JSON dosyası indiriliyor mu?
- [x] İndirilen dosya doğru formatta mı?
- [-] Tüm veriler (dersler, sorular, ayarlar) dahil mi?
- [-] Dosya adı tarih/saat içeriyor mu?

**Veri İçe Aktarma:**

- [x] Veriler içe aktar butonu çalışıyor mu?
- [x] Dosya seçici açılıyor mu?
- [x] JSON dosyası okunuyor mu?
- [?] Geçersiz dosya formatı uyarısı veriyor mu?
- [?] Mevcut verilerle çakışma kontrolü var mı?
- [?] İçe aktarma sonrası veriler görünüyor mu?

**Veri Silme:**

- [x] Tüm verileri sil butonu çalışıyor mu?
- [x] Silme işlemi için onay alınıyor mu?
- [x] Onay dialog'u açılıyor mu?
- [-] Silme işlemi geri alınabiliyor mu?
- [x] Silme sonrası sayfa temizleniyor mu?
- [x] LocalStorage temizleniyor mu?

**Backup Sistemi:**

- [-] Ayarlar JSON dosyası otomatik backup alınıyor mu?
- [x] Backup dosyası doğru konumda mı?
- [x] Backup dosyası okunabilir mi?
- [?] Backup geri yükleme çalışıyor mu?

**UI/UX Testleri:**

- [x] Veri yönetimi sayfası responsive mi?
- [x] Butonlar erişilebilir mi?
- [x] Loading state'ler gösteriliyor mu?
- [x] Success/Error mesajları çıkıyor mu?
- [x] İşlem sonrası feedback veriliyor mu?

### **❓ Soru Yönetimi Testleri:**

**Soru CRUD İşlemleri:**

- [x] Manuel soru ekleme çalışıyor mu?
- [x] Manuel soru güncelleme çalışıyor mu?
- [x] Soru silme çalışıyor mu?
- [-] Soru silerken doğrulama ekranı geliyor mu?
- [x] Soru listesi görüntüleniyor mu?
- [x] Soru detayları görüntüleniyor mu?

**Soru Arama ve Filtreleme:**

- [x] Soru arama kutusu çalışıyor mu?
- [x] Arama sonuçları doğru mu?
- [-] Filtreleme seçenekleri çalışıyor mu? (Tümü, Kolay, Orta Zor)
- [?] Sıralama seçenekleri çalışıyor mu? (Derslere göre: (Matematik, Türkçe))

**Veri Yönetimi:**

- [x] LocalStorage'a kaydediliyor mu?
- [x] Veriler sayfa yenilendiğinde korunuyor mu?
- [x] Soru verileri doğru formatta mı?
- [?] Veri bütünlüğü kontrol ediliyor mu?

**Form Validasyonu:**

- [x] Boş soru metni kabul edilmiyor mu?
- [x] Boş seçenekler kabul edilmiyor mu?
- [x] Doğru cevap seçimi zorunlu mu?
- [x] Soru zorluğu seçimi zorunlu mu?
- [x] Ders seçimi zorunlu mu?

**UI/UX Testleri:**

- [x] Soru yönetim ekranı responsive mi?
- [x] Form alanları düzgün çalışıyor mu?
- [x] Loading state'ler gösteriliyor mu?
- [x] Success/Error mesajları çıkıyor mu?
- [?] Soru listesi pagination'ı çalışıyor mu?
- [x] Soru düzenleme modal'ı çalışıyor mu?

**Soru İçeriği Testleri:**

- [x] Soru metni düzgün kaydediliyor mu?
- [x] Seçenekler doğru kaydediliyor mu?
- [x] Doğru cevap işaretleniyor mu?
- [x] Açıklama alanı çalışıyor mu?
- [?] Zorluk seviyesi kaydediliyor mu?

### **🧠 Akıllı Konu Anlatımı Testleri:**

**Boş Durum Kontrolü:**

- [x] Ders olmayınca boş durum ekranı çıkıyor mu?
- [x] Boş durum mesajı açıklayıcı mı?
- [x] Ders ekleme yönlendirmesi var mı?

**Loading ve Oyun:**

- [x] Loading ekranında breakout oynanıyor mu?
- [x] Oyun loading süresince çalışıyor mu?
- [x] Loading progress bar gösteriliyor mu?

**AI Konu Üretimi:**

- [x] Dinamik olarak konu üretiliyor mu?
- [?] AI konu üretimi hızlı mı?
- [x] Üretilen konular kaliteli mi?
- [x] Konu başlıkları anlamlı mı?

**Responsive Design:**

- [x-?] Bütün sayfalar responsive mi? (Çok nadir durumlarda mobil responsive bozulabiliyor)
- [x] Mobil uyumluluk var mı?
- [x] Tablet uyumluluk var mı?
- [x] Desktop görünümü düzgün mü?

**AI Resim Üretimi:**

- [x] AI ile düzgün resim üretilebiliyor mu?
- [x] AI ile üretilen resim konularla alakalı mı?
- [x] Resim kalitesi iyi mi?
- [x] Resim yükleme hızlı mı?
- [x] Resim boyutları uygun mu?

**Veri Yönetimi:**

- [x] Konu anlatımları LocalStorage'a kaydediliyor mu?
- [x] Veriler sayfa yenilendiğinde korunuyor mu?
- [x] Konu verileri doğru formatta mı?

**AI Konu Anlatımı:**

- [x] AI konuyu açıklayıcı bir şekilde anlatabiliyor mu?
- [x] Özemsetici örnekler verebiliyor mu?
- [x] Anlatım seviyesi uygun mu?
- [x] Markdown formatında mı?
- [x] Kod örnekleri var mı?

**Konu Yönetimi:**

- [x] AI ile üretilen konular silinebiliyor mu?
- [x] AI ile üretilen konular baştan oluşturulabiliyor mu?
- [-] Konu düzenleme çalışıyor mu?
- [x] Konu listesi görüntüleniyor mu?

**UI/UX Testleri:**

- [x] Konu anlatım sayfası responsive mi?
- [x] Loading state'ler gösteriliyor mu?
- [x] Success/Error mesajları çıkıyor mu?
- [x] Konu kartları düzgün görünüyor mu?
- [x] Butonlar erişilebilir mi?

### **🤖 AI Tutor - AI Chat Testleri:**

**AI Chat Temel Özellikleri:**

- [ ] AI chat sayfası açılıyor mu?
- [ ] Mesaj gönderme çalışıyor mu?
- [ ] AI cevap veriyor mu?
- [ ] Mesaj geçmişi görüntüleniyor mu?
- [ ] Chat session'ları kaydediliyor mu?

**AI Tutor Özellikleri:**

- [ ] AI tutor modu çalışıyor mu?
- [ ] Konuya özel açıklamalar veriyor mu?
- [ ] Adım adım çözümler sunuyor mu?
- [ ] Örnekler veriyor mu?
- [ ] Zorluk seviyesine göre anlatım yapıyor mu?

**Mesaj Yönetimi:**

- [ ] Mesaj gönderme butonu çalışıyor mu?
- [ ] Enter tuşu ile mesaj gönderiliyor mu?
- [ ] Mesaj input alanı responsive mi?
- [ ] Mesaj karakter limiti var mı?
- [ ] Boş mesaj gönderimi engelleniyor mu?

**AI Cevap Kalitesi:**

- [ ] AI cevapları doğru mu?
- [ ] Cevaplar açıklayıcı mı?
- [ ] Kod örnekleri veriyor mu?
- [ ] Matematiksel formüller düzgün görünüyor mu?
- [ ] Markdown formatı düzgün render ediliyor mu?

**Chat Session Yönetimi:**

- [ ] Yeni chat session başlatılabiliyor mu?
- [ ] Eski session'lar görüntüleniyor mu?
- [ ] Session'lar silinebiliyor mu?
- [ ] Session'lar LocalStorage'da kaydediliyor mu?
- [ ] Session'lar sayfa yenilendiğinde korunuyor mu?

**Loading ve Performance:**

- [ ] AI cevap verirken loading gösteriliyor mu?
- [ ] AI cevap süresi makul mi?
- [ ] Uzun cevaplar düzgün görüntüleniyor mu?
- [ ] Chat performansı iyi mi?

**UI/UX Testleri:**

- [ ] AI chat sayfası responsive mi?
- [ ] Chat arayüzü kullanıcı dostu mu?
- [ ] Mesaj baloncukları düzgün görünüyor mu?
- [ ] AI ve kullanıcı mesajları ayırt edilebiliyor mu?
- [ ] Scroll otomatik olarak en alta gidiyor mu?

**Error Handling:**

- [ ] AI hata verdiğinde uygun mesaj gösteriliyor mu?
- [ ] Network hatası durumunda retry seçeneği var mı?
- [ ] API limit aşımında uyarı veriliyor mu?
- [ ] Timeout durumunda ne oluyor?

**Accessibility:**

- [ ] Chat arayüzü erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekleniyor mu?

### **🎤 AI Tutor Sesli Konuşma Testleri:**

**Sesli Konuşma Temel Özellikleri:**

- [ ] Sesli konuşma butonu çalışıyor mu?
- [ ] Mikrofon erişimi izni alınıyor mu?
- [ ] Ses kaydı başlıyor mu?
- [ ] Ses kaydı durdurulabiliyor mu?
- [ ] Ses kalitesi iyi mi?

**Speech-to-Text (STT) Özellikleri:**

- [ ] Konuşma metne çevriliyor mu?
- [ ] Türkçe dil desteği var mı?
- [ ] Çeviri doğruluğu iyi mi?
- [ ] Gürültü filtreleme çalışıyor mu?
- [ ] Uzun konuşmalar düzgün çevriliyor mu?

**Text-to-Speech (TTS) Özellikleri:**

- [ ] AI cevapları sesli okunuyor mu?
- [ ] Ses kalitesi iyi mi?
- [ ] Türkçe telaffuz doğru mu?
- [ ] Ses hızı ayarlanabiliyor mu?
- [ ] Ses tonu ayarlanabiliyor mu?

**Sesli Komutlar:**

- [ ] "Soru oku" komutu çalışıyor mu?
- [ ] "Şıkları oku" komutu çalışıyor mu?
- [ ] "Açıklama oku" komutu çalışıyor mu?
- [ ] "İpucu oku" komutu çalışıyor mu?
- [ ] "Duraklat" komutu çalışıyor mu?

**Sesli Navigasyon:**

- [ ] "Sonraki soru" komutu çalışıyor mu?
- [ ] "Önceki soru" komutu çalışıyor mu?
- [ ] "Karıştır" komutu çalışıyor mu?
- [ ] "Yeni test başlat" komutu çalışıyor mu?

**Ses Ayarları:**

- [ ] Ses seviyesi ayarlanabiliyor mu?
- [ ] Mikrofon hassasiyeti ayarlanabiliyor mu?
- [ ] Ses kalitesi seçenekleri var mı?
- [ ] Ses formatı seçenekleri var mı?

**Error Handling:**

- [ ] Mikrofon erişimi reddedildiğinde uyarı veriliyor mu?
- [ ] Ses kaydı başarısız olduğunda mesaj gösteriliyor mu?
- [ ] STT hatası durumunda retry seçeneği var mı?
- [ ] TTS hatası durumunda alternatif gösteriliyor mu?

**UI/UX Testleri:**

- [ ] Sesli konuşma arayüzü kullanıcı dostu mu?
- [ ] Ses kayıt göstergesi çalışıyor mu?
- [ ] Ses seviyesi göstergesi var mı?
- [ ] Sesli komutlar için görsel ipuçları var mı?
- [ ] Sesli mod açık/kapalı göstergesi var mı?

**Performance Testleri:**

- [ ] Ses kaydı gecikmesi makul mi?
- [ ] STT çeviri hızı iyi mi?
- [ ] TTS okuma hızı uygun mu?
- [ ] Ses dosyası boyutu optimize mi?

**Accessibility:**

- [ ] Sesli özellikler görme engelliler için uygun mu?
- [ ] Klavye ile sesli komutlar verilebiliyor mu?
- [ ] Sesli geri bildirimler var mı?
- [ ] Sesli navigasyon alternatifleri var mı?

### **💬 AI Tutor Chat Geçmişi Testleri:**

**Chat Geçmişi Görüntüleme:**

- [ ] Chat geçmişi listesi görüntüleniyor mu?
- [ ] Eski chat'ler tarih sırasına göre sıralanıyor mu?
- [ ] Chat başlıkları görüntüleniyor mu?
- [ ] Chat önizleme mesajları gösteriliyor mu?
- [ ] Chat tarihleri görüntüleniyor mu?

**Chat Geçmişi Yönetimi:**

- [ ] Eski chat'e tıklayınca açılıyor mu?
- [ ] Chat geçmişi LocalStorage'da kaydediliyor mu?
- [ ] Chat geçmişi sayfa yenilendiğinde korunuyor mu?
- [ ] Chat geçmişi limiti var mı?
- [ ] Eski chat'ler otomatik siliniyor mu?

**Chat Arama ve Filtreleme:**

- [ ] Chat geçmişinde arama yapılabiliyor mu?
- [ ] Chat'ler konuya göre filtrelenebiliyor mu?
- [ ] Chat'ler tarihe göre filtrelenebiliyor mu?
- [ ] Arama sonuçları doğru mu?

**Chat Silme ve Düzenleme:**

- [ ] Chat silme butonu çalışıyor mu?
- [ ] Chat silme onayı alınıyor mu?
- [ ] Chat başlığı düzenlenebiliyor mu?
- [ ] Chat düzenleme kaydediliyor mu?

### **🆕 Yeni Chat Oluşturma Testleri:**

**Yeni Chat Başlatma:**

- [ ] "Yeni Chat" butonu çalışıyor mu?
- [ ] Yeni chat sayfası açılıyor mu?
- [ ] Yeni chat otomatik başlık alıyor mu?
- [ ] Yeni chat boş durumda mı?
- [ ] Yeni chat'e mesaj gönderilebiliyor mu?

**Chat Başlık Yönetimi:**

- [ ] Chat başlığı otomatik oluşturuluyor mu?
- [ ] Chat başlığı düzenlenebiliyor mu?
- [ ] Başlık değişikliği kaydediliyor mu?
- [ ] Başlık karakter limiti var mı?
- [ ] Boş başlık kabul edilmiyor mu?

**Chat Ayarları:**

- [ ] Chat konusu seçilebiliyor mu?
- [ ] Chat zorluk seviyesi ayarlanabiliyor mu?
- [ ] Chat dil seçimi yapılabiliyor mu?
- [ ] Chat ayarları kaydediliyor mu?

### **📚 Konu Seçim Dropdown Testleri:**

**Dropdown Temel Özellikleri:**

- [ ] Konu seçim dropdown'ı açılıyor mu?
- [ ] Mevcut dersler dropdown'da görünüyor mu?
- [ ] Dropdown'dan konu seçilebiliyor mu?
- [ ] Seçilen konu görüntüleniyor mu?
- [ ] Dropdown kapatılabiliyor mu?

**Konu Filtreleme:**

- [ ] Dropdown'da arama yapılabiliyor mu?
- [ ] Arama sonuçları doğru mu?
- [ ] Konular alfabetik sıralanıyor mu?
- [ ] Popüler konular üstte mi?

**Konu Kategorileri:**

- [ ] Konular kategorilere ayrılmış mı?
- [ ] Kategori başlıkları görünüyor mu?
- [ ] Kategoriler açılıp kapanabiliyor mu?
- [ ] Alt kategoriler var mı?

**Responsive Dropdown:**

- [ ] Dropdown mobilde düzgün çalışıyor mu?
- [ ] Touch ile seçim yapılabiliyor mu?
- [ ] Dropdown ekran dışına taşmıyor mu?
- [ ] Scroll çalışıyor mu?

**Error Handling:**

- [ ] Konu bulunamadığında mesaj gösteriliyor mu?
- [ ] Dropdown yüklenirken loading gösteriliyor mu?
- [ ] Hata durumunda retry seçeneği var mı?
- [ ] Boş konu listesi durumunda uyarı var mı?

**UI/UX Testleri:**

- [ ] Dropdown animasyonları düzgün mü?
- [ ] Seçilen konu vurgulanıyor mu?
- [ ] Hover efektleri çalışıyor mu?
- [ ] Focus states düzgün mü?
- [ ] Keyboard navigasyonu çalışıyor mu?

### **📝 FlashCard Sayfası ve Özellikleri Testleri:**

**FlashCard Temel Özellikleri:**

- [ ] FlashCard sayfası açılıyor mu?
- [ ] FlashCard'lar görüntüleniyor mu?
- [ ] FlashCard çevirme çalışıyor mu?
- [ ] FlashCard animasyonları düzgün mü?
- [ ] FlashCard içeriği doğru mu?

**FlashCard Navigasyonu:**

- [ ] "Sonraki" butonu çalışıyor mu?
- [ ] "Önceki" butonu çalışıyor mu?
- [ ] FlashCard numarası gösteriliyor mu?
- [ ] Toplam FlashCard sayısı gösteriliyor mu?
- [ ] İlk/son FlashCard'da butonlar devre dışı mı?

**FlashCard İçerik Yönetimi:**

- [ ] FlashCard soruları doğru mu?
- [ ] FlashCard cevapları doğru mu?
- [ ] FlashCard açıklamaları var mı?
- [ ] FlashCard zorluk seviyesi gösteriliyor mu?
- [ ] FlashCard kategorisi gösteriliyor mu?

**FlashCard Etkileşimi:**

- [ ] FlashCard'a tıklayınca çevriliyor mu?
- [ ] FlashCard'a dokununca çevriliyor mu?
- [ ] Klavye ile FlashCard çevrilebiliyor mu?
- [ ] FlashCard çevirme animasyonu düzgün mü?
- [ ] FlashCard çevirme sesi var mı?

**FlashCard Filtreleme ve Arama:**

- [ ] FlashCard arama kutusu çalışıyor mu?
- [ ] FlashCard'lar konuya göre filtrelenebiliyor mu?
- [ ] FlashCard'lar zorluk seviyesine göre filtrelenebiliyor mu?
- [ ] Arama sonuçları doğru mu?
- [ ] Filtreleme seçenekleri görünüyor mu?

**FlashCard Ayarları:**

- [ ] FlashCard hızı ayarlanabiliyor mu?
- [ ] FlashCard otomatik çevirme var mı?
- [ ] FlashCard çevirme yönü ayarlanabiliyor mu?
- [ ] FlashCard görünüm modu seçilebiliyor mu?
- [ ] FlashCard ayarları kaydediliyor mu?

**FlashCard İstatistikleri:**

- [ ] Çalışılan FlashCard sayısı gösteriliyor mu?
- [ ] Doğru/yanlış oranı hesaplanıyor mu?
- [ ] Çalışma süresi takip ediliyor mu?
- [ ] İstatistikler LocalStorage'da kaydediliyor mu?
- [ ] İstatistikler grafik olarak gösteriliyor mu?

**FlashCard Çalışma Modları:**

- [ ] "Öğrenme" modu çalışıyor mu?
- [ ] "Tekrar" modu çalışıyor mu?
- [ ] "Test" modu çalışıyor mu?
- [ ] Mod değiştirme çalışıyor mu?
- [ ] Mod ayarları kaydediliyor mu?

**FlashCard Sesli Özellikler:**

- [ ] FlashCard soruları sesli okunuyor mu?
- [ ] FlashCard cevapları sesli okunuyor mu?
- [ ] Sesli komutlar çalışıyor mu?
- [ ] Ses ayarları yapılabiliyor mu?
- [ ] Ses kalitesi iyi mi?

**Responsive Design:**

- [ ] FlashCard sayfası mobilde düzgün çalışıyor mu?
- [ ] FlashCard'lar tablet'te düzgün görünüyor mu?
- [ ] Touch gesture'lar çalışıyor mu?
- [ ] Butonlar mobilde erişilebilir mi?
- [ ] FlashCard boyutları responsive mi?

**Error Handling:**

- [ ] FlashCard bulunamadığında mesaj gösteriliyor mu?
- [ ] FlashCard yüklenirken loading gösteriliyor mu?
- [ ] Hata durumunda retry seçeneği var mı?
- [ ] Boş FlashCard listesi durumunda uyarı var mı?

**UI/UX Testleri:**

- [ ] FlashCard animasyonları düzgün mü?
- [ ] FlashCard kartları güzel görünüyor mu?
- [ ] Butonlar kullanıcı dostu mu?
- [ ] Progress bar çalışıyor mu?
- [ ] Loading state'ler gösteriliyor mu?

### **📊 Test Çöz Sayfası Testleri:**

**Test Başlatma:**

- [ ] Test çöz sayfası açılıyor mu?
- [ ] Test başlatma butonu çalışıyor mu?
- [ ] Test ayarları seçilebiliyor mu?
- [ ] Test konusu seçilebiliyor mu?
- [ ] Test zorluk seviyesi ayarlanabiliyor mu?

**Test Soruları:**

- [ ] Sorular görüntüleniyor mu?
- [ ] Soru numarası gösteriliyor mu?
- [ ] Toplam soru sayısı gösteriliyor mu?
- [ ] Soru içeriği doğru mu?
- [ ] Soru seçenekleri görüntüleniyor mu?

**Test Navigasyonu:**

- [ ] "Sonraki soru" butonu çalışıyor mu?
- [ ] "Önceki soru" butonu çalışıyor mu?
- [ ] Soru numarasına tıklayarak geçiş yapılabiliyor mu?
- [ ] İlk/son soruda butonlar devre dışı mı?
- [ ] Progress bar güncelleniyor mu?

**Cevap Seçimi:**

- [ ] Cevap seçenekleri tıklanabilir mi?
- [ ] Seçilen cevap vurgulanıyor mu?
- [ ] Cevap değiştirilebiliyor mu?
- [ ] Çoklu cevap seçimi var mı?
- [ ] Cevap seçimi kaydediliyor mu?

**Zamanlayıcı:**

- [ ] Zamanlayıcı çalışıyor mu?
- [ ] Zamanlayıcı ayarlanabiliyor mu?
- [ ] Zamanlayıcı gösteriliyor mu?
- [ ] Süre dolduğunda test bitiyor mu?
- [ ] Zamanlayıcı uyarısı veriyor mu?

**Test Tamamlama:**

- [ ] "Testi bitir" butonu çalışıyor mu?
- [ ] Test sonuçları gösteriliyor mu?
- [ ] Doğru/yanlış sayısı hesaplanıyor mu?
- [ ] Puan hesaplanıyor mu?
- [ ] Sonuçlar kaydediliyor mu?

**Test Sonuçları:**

- [ ] Test sonuç sayfası açılıyor mu?
- [ ] Detaylı sonuçlar gösteriliyor mu?
- [ ] Soru bazında sonuçlar var mı?
- [ ] Doğru cevaplar gösteriliyor mu?
- [ ] Yanlış cevaplar işaretleniyor mu?

**Test Ayarları:**

- [ ] Soru sayısı ayarlanabiliyor mu?
- [ ] Zaman limiti ayarlanabiliyor mu?
- [ ] Zorluk seviyesi seçilebiliyor mu?
- [ ] Konu seçimi yapılabiliyor mu?
- [ ] Ayarlar kaydediliyor mu?

### **🎯 Özellik Testleri:**

**Temel Özellikler:**

- [ ] Tüm sayfalar erişilebilir mi?
- [ ] Navigasyon çalışıyor mu?
- [ ] Responsive design var mı?
- [ ] Dark/Light mode çalışıyor mu?
- [ ] Loading state'ler gösteriliyor mu?

**AI Özellikleri:**

- [ ] AI soru üretimi çalışıyor mu?
- [ ] AI chat çalışıyor mu?
- [ ] AI konu anlatımı çalışıyor mu?
- [ ] AI resim üretimi çalışıyor mu?
- [ ] AI sesli özellikler çalışıyor mu?

**Veri Yönetimi:**

- [ ] LocalStorage kaydetme çalışıyor mu?
- [ ] Veri export/import çalışıyor mu?
- [ ] Veri silme çalışıyor mu?
- [ ] Veri backup çalışıyor mu?
- [ ] Veri bütünlüğü korunuyor mu?

**Kullanıcı Yönetimi:**

- [ ] Kullanıcı kaydı çalışıyor mu?
- [ ] Kullanıcı girişi çalışıyor mu?
- [ ] Profil yönetimi çalışıyor mu?
- [ ] Şifre değiştirme çalışıyor mu?
- [ ] Avatar yükleme çalışıyor mu?

**Oyun Özellikleri:**

- [ ] Breakout loading oyunu çalışıyor mu?
- [ ] Oyun kontrolleri çalışıyor mu?
- [ ] Oyun responsive mi?
- [ ] Oyun performansı iyi mi?
- [ ] Oyun sesleri çalışıyor mu?

**PWA Özellikleri:**

- [ ] PWA install prompt çıkıyor mu?
- [ ] Offline çalışıyor mu?
- [ ] App-like deneyim var mı?
- [ ] Service worker çalışıyor mu?
- [ ] Manifest dosyası doğru mu?

**Analytics:**

- [ ] Analytics dashboard çalışıyor mu?
- [ ] Grafikler görüntüleniyor mu?
- [ ] Veriler doğru mu?
- [ ] Performance metrics çalışıyor mu?
- [ ] User tracking çalışıyor mu?

**Error Handling:**

- [ ] Hata mesajları gösteriliyor mu?
- [ ] Network hataları yönetiliyor mu?
- [ ] API hataları yönetiliyor mu?
- [ ] Timeout durumları yönetiliyor mu?
- [ ] Retry mekanizması var mı?

**Performance:**

- [ ] Sayfa yükleme hızı iyi mi?
- [ ] AI cevap süresi makul mi?
- [ ] Oyun performansı iyi mi?
- [ ] Memory kullanımı optimize mi?
- [ ] Bundle size uygun mu?

**Security:**

- [ ] Input validation çalışıyor mu?
- [ ] XSS koruması var mı?
- [ ] CSRF koruması var mı?
- [ ] Data encryption var mı?
- [ ] Secure headers var mı?

### **📊 Dashboard ve Dashboard AI Tutor Tutarlılık Testleri:**

**Dashboard Temel Özellikleri:**

- [ ] Dashboard sayfası açılıyor mu?
- [ ] Dashboard verileri yükleniyor mu?
- [ ] Dashboard responsive mi?
- [ ] Dashboard loading state'leri gösteriliyor mu?
- [ ] Dashboard error handling çalışıyor mu?

**Dashboard AI Tutor Tutarlılığı:**

- [ ] AI Tutor önerileri dashboard'da görünüyor mu?
- [ ] AI Tutor performans verileri tutarlı mı?
- [ ] AI Tutor kullanım istatistikleri doğru mu?
- [ ] AI Tutor önerileri güncel mi?
- [ ] AI Tutor verileri real-time güncelleniyor mu?

**Dashboard Veri Tutarlılığı:**

- [ ] Dashboard verileri diğer sayfalarla tutarlı mı?
- [ ] Test sonuçları dashboard'da doğru görünüyor mu?
- [ ] Kullanıcı istatistikleri doğru mu?
- [ ] Zaman bazlı veriler tutarlı mı?
- [ ] Veri güncelleme sıklığı uygun mu?

**Dashboard AI Özellikleri:**

- [ ] AI performans metrikleri gösteriliyor mu?
- [ ] AI kullanım analizi çalışıyor mu?
- [ ] AI önerileri kişiselleştirilmiş mi?
- [ ] AI öğrenme algoritması çalışıyor mu?
- [ ] AI veri kalitesi kontrol ediliyor mu?

**Dashboard Grafik ve Görselleştirme:**

- [ ] Grafikler düzgün render ediliyor mu?
- [ ] Grafik verileri doğru mu?
- [ ] Grafik animasyonları çalışıyor mu?
- [ ] Grafik responsive mi?
- [ ] Grafik etkileşimleri çalışıyor mu?

### **👤 Guest Modu Dashboard Testleri:**

**Guest Modu Temel Özellikleri:**

- [ ] Guest modu dashboard açılıyor mu?
- [ ] Guest kullanıcı verileri görüntüleniyor mu?
- [ ] Guest modu kısıtlamaları çalışıyor mu?
- [ ] Guest modu uyarıları gösteriliyor mu?
- [ ] Guest modu upgrade prompt'u çıkıyor mu?

**Guest Modu Veri Yedekleme:**

- [ ] Guest modunda veriler JSON olarak yedeklenebiliyor mu?
- [ ] Yedekleme dosyası doğru formatta mı?
- [ ] Yedekleme dosyası tüm verileri içeriyor mu?
- [ ] Yedekleme dosyası tarih/saat içeriyor mu?
- [ ] Yedekleme işlemi hızlı mı?

**Guest Modu Veri İçe Aktarma:**

- [ ] Guest modunda JSON dosyası içe aktarılabiliyor mu?
- [ ] İçe aktarma işlemi doğru çalışıyor mu?
- [ ] İçe aktarılan veriler görüntüleniyor mu?
- [ ] Veri formatı kontrolü yapılıyor mu?
- [ ] Hatalı dosya formatı uyarısı veriliyor mu?

**Guest Modu Veri Tutarlılığı:**

- [ ] Guest verileri LocalStorage'da saklanıyor mu?
- [ ] Guest verileri sayfa yenilendiğinde korunuyor mu?
- [ ] Guest verileri diğer sayfalarla tutarlı mı?
- [ ] Guest verileri sınırlı mı?
- [ ] Guest verileri otomatik temizleniyor mu?

**Guest Modu Kısıtlamalar:**

- [ ] Guest modu özellik kısıtlamaları çalışıyor mu?
- [ ] Guest modu veri limiti var mı?
- [ ] Guest modu süre sınırı var mı?
- [ ] Guest modu upgrade prompt'u çıkıyor mu?
- [ ] Guest modu kayıt yönlendirmesi çalışıyor mu?

**Guest Modu UI/UX:**

- [ ] Guest modu arayüzü kullanıcı dostu mu?
- [ ] Guest modu uyarıları açıklayıcı mı?
- [ ] Guest modu upgrade butonları çalışıyor mu?
- [ ] Guest modu responsive mi?
- [ ] Guest modu loading state'leri gösteriliyor mu?

**Guest Modu Veri Güvenliği:**

- [ ] Guest verileri güvenli şekilde saklanıyor mu?
- [ ] Guest verileri şifreleniyor mu?
- [ ] Guest verileri otomatik temizleniyor mu?
- [ ] Guest verileri başka kullanıcılarla karışmıyor mu?
- [ ] Guest verileri session bazlı mı?

**Guest Modu Performance:**

- [ ] Guest modu hızlı yükleniyor mu?
- [ ] Guest verileri optimize edilmiş mi?
- [ ] Guest modu memory kullanımı uygun mu?
- [ ] Guest modu network kullanımı optimize mi?
- [ ] Guest modu cache mekanizması var mı?

### **🏛️ Demo Modu Testleri:**

**Demo Switch Özellikleri:**

- [ ] Demo switch'i görünüyor mu?
- [ ] Demo switch'i çalışıyor mu?
- [ ] Demo modu açılıp kapanabiliyor mu?
- [ ] Switch durumu kaydediliyor mu?
- [ ] Switch animasyonu düzgün mü?

**Demo Sayfaları:**

- [ ] Demo sayfası açılıyor mu?
- [ ] Demo sayfaları responsive mi?
- [ ] Demo sayfaları loading state'leri gösteriyor mu?
- [ ] Demo sayfaları error handling çalışıyor mu?
- [ ] Demo sayfaları navigation çalışıyor mu?

**Demo İçerikleri:**

- [ ] Demo içerikleri yükleniyor mu?
- [ ] Demo verileri doğru mu?
- [ ] Demo örnekleri kaliteli mi?
- [ ] Demo açıklamaları anlaşılır mı?
- [ ] Demo görselleri yükleniyor mu?

**Demo Etkileşimleri:**

- [ ] Demo etkileşimleri çalışıyor mu?
- [ ] Demo butonları responsive mi?
- [ ] Demo formları çalışıyor mu?
- [ ] Demo animasyonları düzgün mü?
- [ ] Demo hover efektleri çalışıyor mu?

**Demo Özellikleri:**

- [ ] Demo AI özellikleri çalışıyor mu?
- [ ] Demo test çözme çalışıyor mu?
- [ ] Demo flashcard çalışıyor mu?
- [ ] Demo konu anlatımı çalışıyor mu?
- [ ] Demo chat çalışıyor mu?

**Demo Veri Yönetimi:**

- [ ] Demo verileri ayrı saklanıyor mu?
- [ ] Demo verileri gerçek verilerle karışmıyor mu?
- [ ] Demo verileri reset edilebiliyor mu?
- [ ] Demo verileri export edilebiliyor mu?
- [ ] Demo verileri import edilebiliyor mu?

**Demo UI/UX:**

- [ ] Demo arayüzü kullanıcı dostu mu?
- [ ] Demo açıklamaları yeterli mi?
- [ ] Demo yönlendirmeleri çalışıyor mu?
- [ ] Demo responsive design var mı?
- [ ] Demo loading state'leri gösteriliyor mu?

**Demo Performance:**

- [ ] Demo sayfaları hızlı yükleniyor mu?
- [ ] Demo verileri optimize edilmiş mi?
- [ ] Demo memory kullanımı uygun mu?
- [ ] Demo network kullanımı optimize mi?
- [ ] Demo cache mekanizması var mı?

**Demo Güvenlik:**

- [ ] Demo modu güvenli mi?
- [ ] Demo verileri izole edilmiş mi?
- [ ] Demo modu gerçek verilere erişemiyor mu?
- [ ] Demo modu sınırlı mı?
- [ ] Demo modu kontrollü mü?

**Demo Error Handling:**

- [ ] Demo hata mesajları gösteriliyor mu?
- [ ] Demo network hataları yönetiliyor mu?
- [ ] Demo API hataları yönetiliyor mu?
- [ ] Demo timeout durumları yönetiliyor mu?
- [ ] Demo retry mekanizması var mı?

**Demo Accessibility:**

- [ ] Demo sayfaları erişilebilir mi?
- [ ] Demo klavye navigasyonu çalışıyor mu?
- [ ] Demo screen reader uyumlu mu?
- [ ] Demo yüksek kontrast modu destekliyor mu?
- [ ] Demo focus states düzgün mü?

### **📞 Contact Sayfası Feature, Linkler ve Responsive Testleri:**

**Contact Sayfası Temel Özellikleri:**

- [ ] Contact sayfası açılıyor mu?
- [ ] Contact formu görüntüleniyor mu?
- [ ] Contact sayfası responsive mi?
- [ ] Contact sayfası loading state'leri gösteriyor mu?
- [ ] Contact sayfası error handling çalışıyor mu?

**Contact Form Özellikleri:**

- [ ] İsim alanı çalışıyor mu?
- [ ] Email alanı çalışıyor mu?
- [ ] Konu alanı çalışıyor mu?
- [ ] Mesaj alanı çalışıyor mu?
- [ ] Form validasyonu çalışıyor mu?

**Contact Form Validasyonu:**

- [ ] Boş alan kontrolü yapılıyor mu?
- [ ] Email format kontrolü yapılıyor mu?
- [ ] Minimum karakter kontrolü var mı?
- [ ] Maksimum karakter kontrolü var mı?
- [ ] Özel karakter kontrolü yapılıyor mu?

**Contact Form Gönderimi:**

- [ ] Form gönderme butonu çalışıyor mu?
- [ ] Form başarıyla gönderiliyor mu?
- [ ] Gönderim sonrası onay mesajı gösteriliyor mu?
- [ ] Form temizleniyor mu?
- [ ] Gönderim sırasında loading gösteriliyor mu?

**Contact Sayfası Linkleri:**

- [ ] Email linki çalışıyor mu?
- [ ] Telefon linki çalışıyor mu?
- [ ] Sosyal medya linkleri çalışıyor mu?
- [ ] Adres linki çalışıyor mu?
- [ ] Harita linki çalışıyor mu?

**Contact Sayfası Sosyal Medya:**

- [ ] Facebook linki çalışıyor mu?
- [ ] Twitter linki çalışıyor mu?
- [ ] Instagram linki çalışıyor mu?
- [ ] LinkedIn linki çalışıyor mu?
- [ ] YouTube linki çalışıyor mu?

**Contact Sayfası Responsive Design:**

- [ ] Contact sayfası mobilde düzgün görünüyor mu?
- [ ] Contact sayfası tablet'te düzgün görünüyor mu?
- [ ] Contact sayfası desktop'ta düzgün görünüyor mu?
- [ ] Form alanları mobilde kullanılabilir mi?
- [ ] Butonlar mobilde erişilebilir mi?

**Contact Sayfası UI/UX:**

- [ ] Contact sayfası kullanıcı dostu mu?
- [ ] Form alanları düzenli mi?
- [ ] Butonlar belirgin mi?
- [ ] Yazılar okunabilir mi?
- [ ] Renkler uyumlu mu?

**Contact Sayfası Loading States:**

- [ ] Sayfa yüklenirken loading gösteriliyor mu?
- [ ] Form gönderilirken loading gösteriliyor mu?
- [ ] Link tıklanırken loading gösteriliyor mu?
- [ ] Loading animasyonları düzgün mü?
- [ ] Loading mesajları açıklayıcı mı?

**Contact Sayfası Error Handling:**

- [ ] Form hataları gösteriliyor mu?
- [ ] Network hataları yönetiliyor mu?
- [ ] API hataları yönetiliyor mu?
- [ ] Timeout durumları yönetiliyor mu?
- [ ] Retry seçeneği var mı?

**Contact Sayfası Accessibility:**

- [ ] Contact sayfası erişilebilir mi?
- [ ] Form alanları label'lı mı?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?

**Contact Sayfası Performance:**

- [ ] Contact sayfası hızlı yükleniyor mu?
- [ ] Form gönderimi hızlı mı?
- [ ] Link tıklamaları hızlı mı?
- [ ] Sayfa performansı iyi mi?
- [ ] Memory kullanımı uygun mu?

**Contact Sayfası SEO:**

- [ ] Contact sayfası SEO uyumlu mu?
- [ ] Meta title doğru mu?
- [ ] Meta description var mı?
- [ ] H1, H2, H3 etiketleri düzgün mü?
- [ ] Alt text'ler var mı?

**Contact Sayfası Analytics:**

- [ ] Contact sayfası ziyaretleri takip ediliyor mu?
- [ ] Form gönderimleri takip ediliyor mu?
- [ ] Link tıklamaları takip ediliyor mu?
- [ ] Sayfa süreleri takip ediliyor mu?
- [ ] Bounce rate takip ediliyor mu?

### **❓ Yardım Sayfası Feature, Açıklayıcılık, Öğreticilik, Linkler ve Responsive Testleri:**

**Yardım Sayfası Temel Özellikleri:**

- [ ] Yardım sayfası açılıyor mu?
- [ ] Yardım içerikleri yükleniyor mu?
- [ ] Yardım sayfası responsive mi?
- [ ] Yardım sayfası loading state'leri gösteriyor mu?
- [ ] Yardım sayfası error handling çalışıyor mu?

**Yardım Sayfası Açıklayıcılık:**

- [ ] Yardım içerikleri açıklayıcı mı?
- [ ] Adım adım açıklamalar var mı?
- [ ] Örnekler veriliyor mu?
- [ ] Görseller kullanılıyor mu?
- [ ] Video açıklamalar var mı?

**Yardım Sayfası Öğreticilik:**

- [ ] Yardım içerikleri öğretici mi?
- [ ] Kullanıcı seviyesine uygun mu?
- [ ] Başlangıç seviyesi açıklamalar var mı?
- [ ] İleri seviye açıklamalar var mı?
- [ ] Pratik örnekler veriliyor mu?

**Yardım Sayfası Kategorileri:**

- [ ] Yardım kategorileri organize mi?
- [ ] Kategori başlıkları açık mı?
- [ ] Alt kategoriler var mı?
- [ ] Arama özelliği var mı?
- [ ] Filtreleme seçenekleri var mı?

**Yardım Sayfası Linkleri:**

- [ ] İç linkler çalışıyor mu?
- [ ] Dış linkler çalışıyor mu?
- [ ] Video linkleri çalışıyor mu?
- [ ] Dokümantasyon linkleri çalışıyor mu?
- [ ] İletişim linkleri çalışıyor mu?

**Yardım Sayfası Navigasyonu:**

- [ ] Yardım menüsü çalışıyor mu?
- [ ] Breadcrumb navigasyonu var mı?
- [ ] "Geri" butonu çalışıyor mu?
- [ ] "Ana sayfa" linki çalışıyor mu?
- [ ] "İletişim" linki çalışıyor mu?

**Yardım Sayfası Responsive Design:**

- [ ] Yardım sayfası mobilde düzgün görünüyor mu?
- [ ] Yardım sayfası tablet'te düzgün görünüyor mu?
- [ ] Yardım sayfası desktop'ta düzgün görünüyor mu?
- [ ] Menü mobilde düzgün çalışıyor mu?
- [ ] İçerikler mobilde okunabilir mi?

**Yardım Sayfası UI/UX:**

- [ ] Yardım sayfası kullanıcı dostu mu?
- [ ] İçerikler düzenli mi?
- [ ] Yazılar okunabilir mi?
- [ ] Renkler uyumlu mu?
- [ ] Butonlar belirgin mi?

**Yardım Sayfası İçerik Kalitesi:**

- [ ] İçerikler güncel mi?
- [ ] İçerikler doğru mu?
- [ ] İçerikler eksiksiz mi?
- [ ] İçerikler anlaşılır mı?
- [ ] İçerikler yeterli mi?

**Yardım Sayfası Etkileşim:**

- [ ] Accordion menüler çalışıyor mu?
- [ ] Tab'lar çalışıyor mu?
- [ ] Modal'lar çalışıyor mu?
- [ ] Tooltip'ler çalışıyor mu?
- [ ] Hover efektleri çalışıyor mu?

**Yardım Sayfası Arama:**

- [ ] Arama kutusu çalışıyor mu?
- [ ] Arama sonuçları doğru mu?
- [ ] Arama filtreleri çalışıyor mu?
- [ ] Arama geçmişi kaydediliyor mu?
- [ ] Arama önerileri çalışıyor mu?

**Yardım Sayfası Video İçerikleri:**

- [ ] Video içerikleri yükleniyor mu?
- [ ] Video oynatıcı çalışıyor mu?
- [ ] Video kalitesi iyi mi?
- [ ] Video kontrolleri çalışıyor mu?
- [ ] Video responsive mi?

**Yardım Sayfası Dokümantasyon:**

- [ ] PDF dokümantasyonu var mı?
- [ ] PDF indirme çalışıyor mu?
- [ ] PDF görüntüleme çalışıyor mu?
- [ ] Dokümantasyon güncel mi?
- [ ] Dokümantasyon eksiksiz mi?

**Yardım Sayfası Feedback:**

- [ ] "Bu sayfa yardımcı oldu mu?" butonu var mı?
- [ ] Feedback formu çalışıyor mu?
- [ ] Feedback gönderimi çalışıyor mu?
- [ ] Feedback sonuçları kaydediliyor mu?
- [ ] Feedback analizi yapılıyor mu?

**Yardım Sayfası Performance:**

- [ ] Yardım sayfası hızlı yükleniyor mu?
- [ ] İçerikler optimize edilmiş mi?
- [ ] Görseller optimize edilmiş mi?
- [ ] Video yükleme hızlı mı?
- [ ] Sayfa performansı iyi mi?

**Yardım Sayfası Accessibility:**

- [ ] Yardım sayfası erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?
- [ ] Alt text'ler var mı?

**Yardım Sayfası SEO:**

- [ ] Yardım sayfası SEO uyumlu mu?
- [ ] Meta title doğru mu?
- [ ] Meta description var mı?
- [ ] Heading etiketleri düzgün mü?
- [ ] URL yapısı SEO dostu mu?

### **💰 Pricing Page Sayfası Features, Cards ve Responsive Açıklayıcılık Testleri:**

**Pricing Page Temel Özellikleri:**

- [ ] Pricing sayfası açılıyor mu?
- [ ] Pricing kartları görüntüleniyor mu?
- [ ] Pricing sayfası responsive mi?
- [ ] Pricing sayfası loading state'leri gösteriyor mu?
- [ ] Pricing sayfası error handling çalışıyor mu?

**Pricing Cards Özellikleri:**

- [ ] Pricing kartları düzgün görünüyor mu?
- [ ] Kart başlıkları doğru mu?
- [ ] Fiyatlar doğru mu?
- [ ] Fiyat birimleri gösteriliyor mu?
- [ ] İndirim bilgileri var mı?

**Pricing Cards İçerikleri:**

- [ ] Özellik listeleri doğru mu?
- [ ] Özellik açıklamaları anlaşılır mı?
- [ ] Özellik ikonları var mı?
- [ ] Özellik detayları açıklayıcı mı?
- [ ] Özellik karşılaştırması var mı?

**Pricing Cards Etkileşimleri:**

- [ ] Kartlara tıklanabiliyor mu?
- [ ] Hover efektleri çalışıyor mu?
- [ ] Seçili kart vurgulanıyor mu?
- [ ] Kart animasyonları düzgün mü?
- [ ] Kart geçişleri smooth mu?

**Pricing Cards Responsive Design:**

- [ ] Kartlar mobilde düzgün görünüyor mu?
- [ ] Kartlar tablet'te düzgün görünüyor mu?
- [ ] Kartlar desktop'ta düzgün görünüyor mu?
- [ ] Kart boyutları responsive mi?
- [ ] Kart düzeni responsive mi?

**Pricing Cards Açıklayıcılık:**

- [ ] Fiyat açıklamaları net mi?
- [ ] Özellik açıklamaları detaylı mı?
- [ ] Kullanım limitleri açık mı?
- [ ] Kısıtlamalar belirtiliyor mu?
- [ ] Avantajlar vurgulanıyor mu?

**Pricing Cards Özellik Detayları:**

- [ ] AI özellikleri açıklanıyor mu?
- [ ] Test sayısı limitleri belirtiliyor mu?
- [ ] Kullanıcı sayısı limitleri var mı?
- [ ] Depolama limitleri açık mı?
- [ ] Destek seviyeleri belirtiliyor mu?

**Pricing Cards Karşılaştırma:**

- [ ] Plan karşılaştırma tablosu var mı?
- [ ] Karşılaştırma detaylı mı?
- [ ] Farklar vurgulanıyor mu?
- [ ] En popüler plan işaretleniyor mu?
- [ ] Önerilen plan belirtiliyor mu?

**Pricing Cards Butonları:**

- [ ] "Seç" butonları çalışıyor mu?
- [ ] "Ücretsiz Deneme" butonları var mı?
- [ ] "Satın Al" butonları çalışıyor mu?
- [ ] Buton renkleri uyumlu mu?
- [ ] Buton metinleri açık mı?

**Pricing Cards Loading States:**

- [ ] Kartlar yüklenirken loading gösteriliyor mu?
- [ ] Buton tıklanırken loading gösteriliyor mu?
- [ ] Sayfa geçişlerinde loading var mı?
- [ ] Loading animasyonları düzgün mü?
- [ ] Loading mesajları açıklayıcı mı?

**Pricing Cards Error Handling:**

- [ ] Fiyat yüklenemezse hata mesajı gösteriliyor mu?
- [ ] Kart yüklenemezse alternatif gösteriliyor mu?
- [ ] Buton tıklanırken hata yönetiliyor mu?
- [ ] Network hatası durumunda retry var mı?
- [ ] Timeout durumunda uyarı veriliyor mu?

**Pricing Cards Accessibility:**

- [ ] Kartlar erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?
- [ ] Alt text'ler var mı?

**Pricing Cards Performance:**

- [ ] Kartlar hızlı yükleniyor mu?
- [ ] Kart animasyonları smooth mu?
- [ ] Sayfa performansı iyi mi?
- [ ] Memory kullanımı uygun mu?
- [ ] Network kullanımı optimize mi?

**Pricing Cards SEO:**

- [ ] Pricing sayfası SEO uyumlu mu?
- [ ] Meta title doğru mu?
- [ ] Meta description var mı?
- [ ] Heading etiketleri düzgün mü?
- [ ] Schema markup var mı?

**Pricing Cards Analytics:**

- [ ] Kart görüntülemeleri takip ediliyor mu?
- [ ] Buton tıklamaları takip ediliyor mu?
- [ ] Plan seçimleri takip ediliyor mu?
- [ ] Sayfa süreleri takip ediliyor mu?
- [ ] Conversion rate takip ediliyor mu?

**Pricing Cards A/B Testing:**

- [ ] Farklı fiyatlandırma testleri var mı?
- [ ] Farklı kart düzenleri test ediliyor mu?
- [ ] Farklı buton metinleri test ediliyor mu?
- [ ] Test sonuçları analiz ediliyor mu?
- [ ] Optimizasyon yapılıyor mu?

**Pricing Cards Localization:**

- [ ] Fiyatlar yerel para biriminde mi?
- [ ] Tarih formatları yerel mi?
- [ ] Metinler çevrilmiş mi?
- [ ] Kültürel uyumluluk var mı?
- [ ] Yerel vergi bilgileri var mı?

### **🧭 Navigation Responsiveness, Açılabilirlik Menüler ve Hamburger Menu Testleri:**

**Navigation Temel Özellikleri:**

- [ ] Navigation bar görünüyor mu?
- [ ] Navigation responsive mi?
- [ ] Navigation loading state'leri gösteriyor mu?
- [ ] Navigation error handling çalışıyor mu?
- [ ] Navigation performansı iyi mi?

**Hamburger Menu Özellikleri:**

- [ ] Hamburger menu butonu görünüyor mu?
- [ ] Hamburger menu butonu çalışıyor mu?
- [ ] Hamburger menu açılıyor mu?
- [ ] Hamburger menu kapanıyor mu?
- [ ] Hamburger menu animasyonu düzgün mü?

**Hamburger Menu İçerikleri:**

- [ ] Menü öğeleri görüntüleniyor mu?
- [ ] Menü öğeleri doğru sıralanıyor mu?
- [ ] Menü öğeleri tıklanabilir mi?
- [ ] Menü öğeleri yönlendirme yapıyor mu?
- [ ] Menü öğeleri aktif durumda mı?

**Hamburger Menu Responsive Design:**

- [ ] Hamburger menu mobilde düzgün çalışıyor mu?
- [ ] Hamburger menu tablet'te düzgün çalışıyor mu?
- [ ] Hamburger menu desktop'ta gizleniyor mu?
- [ ] Menü boyutları responsive mi?
- [ ] Menü konumu responsive mi?

**Navigation Responsive Design:**

- [ ] Navigation mobilde düzgün görünüyor mu?
- [ ] Navigation tablet'te düzgün görünüyor mu?
- [ ] Navigation desktop'ta düzgün görünüyor mu?
- [ ] Navigation boyutları responsive mi?
- [ ] Navigation düzeni responsive mi?

**Açılabilirlik Menüleri:**

- [ ] Dropdown menüler çalışıyor mu?
- [ ] Dropdown menüler açılıyor mu?
- [ ] Dropdown menüler kapanıyor mu?
- [ ] Dropdown menü animasyonları düzgün mü?
- [ ] Dropdown menü içerikleri doğru mu?

**Navigation Etkileşimleri:**

- [ ] Menü öğelerine hover efekti var mı?
- [ ] Menü öğelerine tıklama efekti var mı?
- [ ] Aktif menü öğesi vurgulanıyor mu?
- [ ] Menü geçişleri smooth mu?
- [ ] Menü animasyonları düzgün mü?

**Navigation Accessibility:**

- [ ] Navigation erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?
- [ ] Focus states düzgün mü?

**Navigation Keyboard Navigation:**

- [ ] Tab ile navigasyon çalışıyor mu?
- [ ] Enter ile menü açılıyor mu?
- [ ] Escape ile menü kapanıyor mu?
- [ ] Arrow keys ile menü navigasyonu çalışıyor mu?
- [ ] Space ile menü seçimi çalışıyor mu?

**Navigation Touch Interactions:**

- [ ] Touch ile menü açılıyor mu?
- [ ] Touch ile menü kapanıyor mu?
- [ ] Swipe gesture'lar çalışıyor mu?
- [ ] Touch target'lar yeterli büyüklükte mi?
- [ ] Touch feedback var mı?

**Navigation Loading States:**

- [ ] Sayfa yüklenirken navigation loading gösteriliyor mu?
- [ ] Menü açılırken loading gösteriliyor mu?
- [ ] Sayfa geçişlerinde loading var mı?
- [ ] Loading animasyonları düzgün mü?
- [ ] Loading mesajları açıklayıcı mı?

**Navigation Error Handling:**

- [ ] Menü yüklenemezse hata mesajı gösteriliyor mu?
- [ ] Sayfa bulunamazsa 404 yönlendirmesi var mı?
- [ ] Network hatası durumunda retry var mı?
- [ ] Timeout durumunda uyarı veriliyor mu?
- [ ] Error state'ler düzgün yönetiliyor mu?

**Navigation Performance:**

- [ ] Navigation hızlı yükleniyor mu?
- [ ] Menü açılma hızı iyi mi?
- [ ] Sayfa geçiş hızları iyi mi?
- [ ] Navigation memory kullanımı uygun mu?
- [ ] Navigation network kullanımı optimize mi?

**Navigation SEO:**

- [ ] Navigation SEO uyumlu mu?
- [ ] URL yapısı SEO dostu mu?
- [ ] Breadcrumb navigasyonu var mı?
- [ ] Sitemap linkleri var mı?
- [ ] Canonical URL'ler doğru mu?

**Navigation Analytics:**

- [ ] Menü tıklamaları takip ediliyor mu?
- [ ] Sayfa geçişleri takip ediliyor mu?
- [ ] Menü açılma süreleri takip ediliyor mu?
- [ ] Navigation bounce rate takip ediliyor mu?
- [ ] User journey takip ediliyor mu?

**Navigation A/B Testing:**

- [ ] Farklı menü düzenleri test ediliyor mu?
- [ ] Farklı menü pozisyonları test ediliyor mu?
- [ ] Farklı menü animasyonları test ediliyor mu?
- [ ] Test sonuçları analiz ediliyor mu?
- [ ] Optimizasyon yapılıyor mu?

**Navigation Cross-Browser:**

- [ ] Navigation Chrome'da çalışıyor mu?
- [ ] Navigation Firefox'ta çalışıyor mu?
- [ ] Navigation Safari'de çalışıyor mu?
- [ ] Navigation Edge'de çalışıyor mu?
- [ ] Navigation mobile browser'larda çalışıyor mu?

**Navigation Cross-Device:**

- [ ] Navigation iPhone'da çalışıyor mu?
- [ ] Navigation Android'de çalışıyor mu?
- [ ] Navigation iPad'de çalışıyor mu?
- [ ] Navigation tablet'te çalışıyor mu?
- [ ] Navigation desktop'ta çalışıyor mu?

### **🦶 Footer Responsiveness, Açıklayıcılık, Link Erişimleri ve Sayfalara Doğru Erişim Testleri:**

**Footer Temel Özellikleri:**

- [ ] Footer görünüyor mu?
- [ ] Footer responsive mi?
- [ ] Footer loading state'leri gösteriyor mu?
- [ ] Footer error handling çalışıyor mu?
- [ ] Footer performansı iyi mi?

**Footer Responsive Design:**

- [ ] Footer mobilde düzgün görünüyor mu?
- [ ] Footer tablet'te düzgün görünüyor mu?
- [ ] Footer desktop'ta düzgün görünüyor mu?
- [ ] Footer boyutları responsive mi?
- [ ] Footer düzeni responsive mi?

**Footer Açıklayıcılık:**

- [ ] Footer başlıkları açık mı?
- [ ] Footer açıklamaları anlaşılır mı?
- [ ] Footer metinleri okunabilir mi?
- [ ] Footer ikonları açıklayıcı mı?
- [ ] Footer kategorileri organize mi?

**Footer Link Erişimleri:**

- [ ] Footer linkleri çalışıyor mu?
- [ ] Footer linkleri doğru sayfalara yönlendiriyor mu?
- [ ] Footer linkleri yeni sekmede açılıyor mu?
- [ ] Footer linkleri hover efekti var mı?
- [ ] Footer linkleri tıklanabilir mi?

**Footer Sayfa Erişimleri:**

- [ ] "Hakkımızda" linki doğru sayfaya gidiyor mu?
- [ ] "İletişim" linki doğru sayfaya gidiyor mu?
- [ ] "Gizlilik Politikası" linki doğru sayfaya gidiyor mu?
- [ ] "Kullanım Şartları" linki doğru sayfaya gidiyor mu?
- [ ] "Yardım" linki doğru sayfaya gidiyor mu?

**Footer Sosyal Medya Linkleri:**

- [ ] Facebook linki çalışıyor mu?
- [ ] Twitter linki çalışıyor mu?
- [ ] Instagram linki çalışıyor mu?
- [ ] LinkedIn linki çalışıyor mu?
- [ ] YouTube linki çalışıyor mu?

**Footer İletişim Linkleri:**

- [ ] Email linki çalışıyor mu?
- [ ] Telefon linki çalışıyor mu?
- [ ] Adres linki çalışıyor mu?
- [ ] Harita linki çalışıyor mu?
- [ ] İletişim formu linki çalışıyor mu?

**Footer Kategori Linkleri:**

- [ ] "Ürünler" linki doğru sayfaya gidiyor mu?
- [ ] "Hizmetler" linki doğru sayfaya gidiyor mu?
- [ ] "Blog" linki doğru sayfaya gidiyor mu?
- [ ] "Haberler" linki doğru sayfaya gidiyor mu?
- [ ] "Kariyer" linki doğru sayfaya gidiyor mu?

**Footer Yasal Linkleri:**

- [ ] "KVKK" linki doğru sayfaya gidiyor mu?
- [ ] "Çerez Politikası" linki doğru sayfaya gidiyor mu?
- [ ] "Aydınlatma Metni" linki doğru sayfaya gidiyor mu?
- [ ] "Şikayet" linki doğru sayfaya gidiyor mu?
- [ ] "Yasal Uyarı" linki doğru sayfaya gidiyor mu?

**Footer UI/UX:**

- [ ] Footer kullanıcı dostu mu?
- [ ] Footer düzeni düzenli mi?
- [ ] Footer renkleri uyumlu mu?
- [ ] Footer yazıları okunabilir mi?
- [ ] Footer butonları belirgin mi?

**Footer Loading States:**

- [ ] Footer yüklenirken loading gösteriliyor mu?
- [ ] Link tıklanırken loading gösteriliyor mu?
- [ ] Sayfa geçişlerinde loading var mı?
- [ ] Loading animasyonları düzgün mü?
- [ ] Loading mesajları açıklayıcı mı?

**Footer Error Handling:**

- [ ] Link çalışmazsa hata mesajı gösteriliyor mu?
- [ ] Sayfa bulunamazsa 404 yönlendirmesi var mı?
- [ ] Network hatası durumunda retry var mı?
- [ ] Timeout durumunda uyarı veriliyor mu?
- [ ] Error state'ler düzgün yönetiliyor mu?

**Footer Accessibility:**

- [ ] Footer erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?
- [ ] Alt text'ler var mı?

**Footer Performance:**

- [ ] Footer hızlı yükleniyor mu?
- [ ] Link tıklamaları hızlı mı?
- [ ] Sayfa geçiş hızları iyi mi?
- [ ] Footer memory kullanımı uygun mu?
- [ ] Footer network kullanımı optimize mi?

**Footer SEO:**

- [ ] Footer SEO uyumlu mu?
- [ ] Footer linkleri SEO dostu mu?
- [ ] Footer içerikleri SEO uyumlu mu?
- [ ] Footer schema markup var mı?
- [ ] Footer sitemap linkleri var mı?

**Footer Analytics:**

- [ ] Footer link tıklamaları takip ediliyor mu?
- [ ] Footer sayfa geçişleri takip ediliyor mu?
- [ ] Footer kullanım süreleri takip ediliyor mu?
- [ ] Footer bounce rate takip ediliyor mu?
- [ ] Footer conversion rate takip ediliyor mu?

**Footer Cross-Browser:**

- [ ] Footer Chrome'da çalışıyor mu?
- [ ] Footer Firefox'ta çalışıyor mu?
- [ ] Footer Safari'de çalışıyor mu?
- [ ] Footer Edge'de çalışıyor mu?
- [ ] Footer mobile browser'larda çalışıyor mu?

**Footer Cross-Device:**

- [ ] Footer iPhone'da çalışıyor mu?
- [ ] Footer Android'de çalışıyor mu?
- [ ] Footer iPad'de çalışıyor mu?
- [ ] Footer tablet'te çalışıyor mu?
- [ ] Footer desktop'ta çalışıyor mu?

**Footer Content Quality:**

- [ ] Footer içerikleri güncel mi?
- [ ] Footer içerikleri doğru mu?
- [ ] Footer içerikleri eksiksiz mi?
- [ ] Footer içerikleri anlaşılır mı?
- [ ] Footer içerikleri yeterli mi?

**Footer Link Validation:**

- [ ] Footer linkleri geçerli mi?
- [ ] Footer linkleri aktif mi?
- [ ] Footer linkleri güvenli mi?
- [ ] Footer linkleri hızlı mı?
- [ ] Footer linkleri erişilebilir mi?

### **🏠 Landing Page Responsiveness, Açıklayıcılık, Reklamcılık, Pazarlama ve Net Anlatım Testleri:**

**Landing Page Temel Özellikleri:**

- [ ] Landing page açılıyor mu?
- [ ] Landing page responsive mi?
- [ ] Landing page loading state'leri gösteriyor mu?
- [ ] Landing page error handling çalışıyor mu?
- [ ] Landing page performansı iyi mi?

**Landing Page Responsive Design:**

- [ ] Landing page mobilde düzgün görünüyor mu?
- [ ] Landing page tablet'te düzgün görünüyor mu?
- [ ] Landing page desktop'ta düzgün görünüyor mu?
- [ ] Landing page boyutları responsive mi?
- [ ] Landing page düzeni responsive mi?

**Landing Page Açıklayıcılık:**

- [ ] Landing page başlığı açık mı?
- [ ] Landing page alt başlığı anlaşılır mı?
- [ ] Landing page açıklaması net mi?
- [ ] Landing page özellikleri açıklanıyor mu?
- [ ] Landing page faydaları belirtiliyor mu?

**Landing Page Reklamcılık:**

- [ ] Call-to-action butonları çalışıyor mu?
- [ ] CTA butonları dikkat çekici mi?
- [ ] CTA butonları doğru yönlendirme yapıyor mu?
- [ ] CTA butonları responsive mi?
- [ ] CTA butonları erişilebilir mi?

**Landing Page Pazarlama:**

- [ ] Ürün/hizmet avantajları vurgulanıyor mu?
- [ ] Müşteri yorumları gösteriliyor mu?
- [ ] Sosyal kanıtlar (testimonials) var mı?
- [ ] Güven oluşturan elementler var mı?
- [ ] Aciliyet hissi yaratılıyor mu?

**Landing Page Net Anlatım:**

- [ ] Ana mesaj net mi?
- [ ] Değer önerisi açık mı?
- [ ] Problem çözümü net mi?
- [ ] Kullanım senaryoları açıklanıyor mu?
- [ ] Hedef kitle belirtiliyor mu?

**Landing Page Hero Section:**

- [ ] Hero section görünüyor mu?
- [ ] Hero başlığı etkileyici mi?
- [ ] Hero alt başlığı açıklayıcı mı?
- [ ] Hero CTA butonu çalışıyor mu?
- [ ] Hero görseli kaliteli mi?

**Landing Page Özellikler Bölümü:**

- [ ] Özellikler listeleniyor mu?
- [ ] Özellik açıklamaları anlaşılır mı?
- [ ] Özellik ikonları var mı?
- [ ] Özellik faydaları belirtiliyor mu?
- [ ] Özellik karşılaştırması var mı?

**Landing Page Fiyatlandırma:**

- [ ] Fiyatlandırma bilgisi var mı?
- [ ] Fiyatlar net mi?
- [ ] Fiyat avantajları vurgulanıyor mu?
- [ ] Fiyat karşılaştırması var mı?
- [ ] Fiyat CTA butonları çalışıyor mu?

**Landing Page Güven Oluşturma:**

- [ ] Müşteri yorumları gösteriliyor mu?
- [ ] Güven rozetleri (badges) var mı?
- [ ] Sertifikalar gösteriliyor mu?
- [ ] Başarı hikayeleri var mı?
- [ ] Güvenlik bilgileri var mı?

**Landing Page Sosyal Kanıtlar:**

- [ ] Kullanıcı sayısı belirtiliyor mu?
- [ ] İndirme sayısı gösteriliyor mu?
- [ ] Beğeni sayısı var mı?
- [ ] Yıldız değerlendirmeleri var mı?
- [ ] Referanslar gösteriliyor mu?

**Landing Page Form ve Kayıt:**

- [ ] Kayıt formu çalışıyor mu?
- [ ] Form validasyonu var mı?
- [ ] Form güvenli mi?
- [ ] Form responsive mi?
- [ ] Form erişilebilir mi?

**Landing Page Video ve Medya:**

- [ ] Demo video var mı?
- [ ] Video oynatıcı çalışıyor mu?
- [ ] Video kalitesi iyi mi?
- [ ] Görseller optimize edilmiş mi?
- [ ] Medya responsive mi?

**Landing Page SEO:**

- [ ] Landing page SEO uyumlu mu?
- [ ] Meta title doğru mu?
- [ ] Meta description var mı?
- [ ] Heading etiketleri düzgün mü?
- [ ] Schema markup var mı?

**Landing Page Analytics:**

- [ ] Sayfa görüntülemeleri takip ediliyor mu?
- [ ] CTA tıklamaları takip ediliyor mu?
- [ ] Form gönderimleri takip ediliyor mu?
- [ ] Sayfa süreleri takip ediliyor mu?
- [ ] Conversion rate takip ediliyor mu?

**Landing Page A/B Testing:**

- [ ] Farklı başlıklar test ediliyor mu?
- [ ] Farklı CTA butonları test ediliyor mu?
- [ ] Farklı renkler test ediliyor mu?
- [ ] Test sonuçları analiz ediliyor mu?
- [ ] Optimizasyon yapılıyor mu?

**Landing Page Performance:**

- [ ] Sayfa hızlı yükleniyor mu?
- [ ] Görseller optimize edilmiş mi?
- [ ] JavaScript optimize edilmiş mi?
- [ ] CSS optimize edilmiş mi?
- [ ] Sayfa performansı iyi mi?

**Landing Page Accessibility:**

- [ ] Landing page erişilebilir mi?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Screen reader uyumlu mu?
- [ ] Yüksek kontrast modu destekliyor mu?
- [ ] Alt text'ler var mı?

**Landing Page Cross-Browser:**

- [ ] Landing page Chrome'da çalışıyor mu?
- [ ] Landing page Firefox'ta çalışıyor mu?
- [ ] Landing page Safari'de çalışıyor mu?
- [ ] Landing page Edge'de çalışıyor mu?
- [ ] Landing page mobile browser'larda çalışıyor mu?

**Landing Page Cross-Device:**

- [ ] Landing page iPhone'da çalışıyor mu?
- [ ] Landing page Android'de çalışıyor mu?
- [ ] Landing page iPad'de çalışıyor mu?
- [ ] Landing page tablet'te çalışıyor mu?
- [ ] Landing page desktop'ta çalışıyor mu?

**Landing Page Content Quality:**

- [ ] İçerikler güncel mi?
- [ ] İçerikler doğru mu?
- [ ] İçerikler eksiksiz mi?
- [ ] İçerikler anlaşılır mı?
- [ ] İçerikler yeterli mi?

**Landing Page Loading States:**

- [ ] Sayfa yüklenirken loading gösteriliyor mu?
- [ ] Form gönderilirken loading gösteriliyor mu?
- [ ] Video yüklenirken loading gösteriliyor mu?
- [ ] Loading animasyonları düzgün mü?
- [ ] Loading mesajları açıklayıcı mı?

### **🎬 Framer Motion Animasyonları Tutarlılık Testleri:**

**Framer Motion Temel Özellikleri:**

- [ ] Framer Motion kurulu mu?
- [ ] Framer Motion import'ları çalışıyor mu?
- [ ] Framer Motion hook'ları çalışıyor mu?
- [ ] Framer Motion component'leri render ediliyor mu?
- [ ] Framer Motion error handling çalışıyor mu?

**Framer Motion Animasyon Tutarlılığı:**

- [ ] Tüm animasyonlar aynı hızda çalışıyor mu?
- [ ] Animasyon süreleri tutarlı mı?
- [ ] Animasyon easing'leri tutarlı mı?
- [ ] Animasyon delay'leri tutarlı mı?
- [ ] Animasyon repeat'leri tutarlı mı?

**Framer Motion Page Transitions:**

- [ ] Sayfa geçişleri animasyonlu mu?
- [ ] Page transition'ları düzgün çalışıyor mu?
- [ ] Transition süreleri tutarlı mı?
- [ ] Transition easing'leri tutarlı mı?
- [ ] Transition direction'ları tutarlı mı?

**Framer Motion Component Animations:**

- [ ] Button animasyonları çalışıyor mu?
- [ ] Card animasyonları çalışıyor mu?
- [ ] Modal animasyonları çalışıyor mu?
- [ ] Dropdown animasyonları çalışıyor mu?
- [ ] Form animasyonları çalışıyor mu?

**Framer Motion Loading Animations:**

- [ ] Loading spinner animasyonu çalışıyor mu?
- [ ] Skeleton loading animasyonu çalışıyor mu?
- [ ] Progress bar animasyonu çalışıyor mu?
- [ ] Loading state animasyonları tutarlı mı?
- [ ] Loading animasyon süreleri tutarlı mı?

**Framer Motion Hover Animations:**

- [ ] Hover animasyonları çalışıyor mu?
- [ ] Hover scale animasyonları tutarlı mı?
- [ ] Hover color animasyonları tutarlı mı?
- [ ] Hover shadow animasyonları tutarlı mı?
- [ ] Hover transition süreleri tutarlı mı?

**Framer Motion Click Animations:**

- [ ] Click animasyonları çalışıyor mu?
- [ ] Click scale animasyonları tutarlı mı?
- [ ] Click ripple animasyonları tutarlı mı?
- [ ] Click feedback animasyonları tutarlı mı?
- [ ] Click transition süreleri tutarlı mı?

**Framer Motion Entrance Animations:**

- [ ] Fade-in animasyonları çalışıyor mu?
- [ ] Slide-in animasyonları çalışıyor mu?
- [ ] Scale-in animasyonları çalışıyor mu?
- [ ] Entrance animasyon süreleri tutarlı mı?
- [ ] Entrance animasyon delay'leri tutarlı mı?

**Framer Motion Exit Animations:**

- [ ] Fade-out animasyonları çalışıyor mu?
- [ ] Slide-out animasyonları çalışıyor mu?
- [ ] Scale-out animasyonları çalışıyor mu?
- [ ] Exit animasyon süreleri tutarlı mı?
- [ ] Exit animasyon delay'leri tutarlı mı?

**Framer Motion Stagger Animations:**

- [ ] Stagger animasyonları çalışıyor mu?
- [ ] Stagger delay'leri tutarlı mı?
- [ ] Stagger direction'ları tutarlı mı?
- [ ] Stagger easing'leri tutarlı mı?
- [ ] Stagger duration'ları tutarlı mı?

**Framer Motion Variants:**

- [ ] Animation variant'ları çalışıyor mu?
- [ ] Variant transition'ları tutarlı mı?
- [ ] Variant duration'ları tutarlı mı?
- [ ] Variant easing'leri tutarlı mı?
- [ ] Variant delay'leri tutarlı mı?

**Framer Motion Gesture Animations:**

- [ ] Drag animasyonları çalışıyor mu?
- [ ] Swipe animasyonları çalışıyor mu?
- [ ] Pinch animasyonları çalışıyor mu?
- [ ] Gesture animasyon süreleri tutarlı mı?
- [ ] Gesture animasyon easing'leri tutarlı mı?

**Framer Motion Scroll Animations:**

- [ ] Scroll-triggered animasyonlar çalışıyor mu?
- [ ] Scroll progress animasyonları çalışıyor mu?
- [ ] Scroll parallax animasyonları çalışıyor mu?
- [ ] Scroll animasyon süreleri tutarlı mı?
- [ ] Scroll animasyon easing'leri tutarlı mı?

**Framer Motion Layout Animations:**

- [ ] Layout animasyonları çalışıyor mu?
- [ ] Layout transition'ları tutarlı mı?
- [ ] Layout duration'ları tutarlı mı?
- [ ] Layout easing'leri tutarlı mı?
- [ ] Layout delay'leri tutarlı mı?

**Framer Motion Shared Element Animations:**

- [ ] Shared element animasyonları çalışıyor mu?
- [ ] Shared element transition'ları tutarlı mı?
- [ ] Shared element duration'ları tutarlı mı?
- [ ] Shared element easing'leri tutarlı mı?
- [ ] Shared element delay'leri tutarlı mı?

**Framer Motion Performance:**

- [ ] Animasyonlar performanslı mı?
- [ ] Animasyonlar 60fps çalışıyor mu?
- [ ] Animasyonlar CPU'yu yormuyor mu?
- [ ] Animasyonlar memory leak yaratmıyor mu?
- [ ] Animasyonlar battery drain yaratmıyor mu?

**Framer Motion Accessibility:**

- [ ] Animasyonlar reduced motion'a uyumlu mu?
- [ ] Animasyonlar screen reader'larla uyumlu mu?
- [ ] Animasyonlar keyboard navigation ile uyumlu mu?
- [ ] Animasyonlar high contrast mode'da çalışıyor mu?
- [ ] Animasyonlar accessibility guideline'lara uygun mu?

**Framer Motion Cross-Browser:**

- [ ] Animasyonlar Chrome'da çalışıyor mu?
- [ ] Animasyonlar Firefox'ta çalışıyor mu?
- [ ] Animasyonlar Safari'de çalışıyor mu?
- [ ] Animasyonlar Edge'de çalışıyor mu?
- [ ] Animasyonlar mobile browser'larda çalışıyor mu?

**Framer Motion Cross-Device:**

- [ ] Animasyonlar iPhone'da çalışıyor mu?
- [ ] Animasyonlar Android'de çalışıyor mu?
- [ ] Animasyonlar iPad'de çalışıyor mu?
- [ ] Animasyonlar tablet'te çalışıyor mu?
- [ ] Animasyonlar desktop'ta çalışıyor mu?

**Framer Motion Error Handling:**

- [ ] Animasyon hataları yakalanıyor mu?
- [ ] Animasyon fallback'leri var mı?
- [ ] Animasyon error boundary'leri çalışıyor mu?
- [ ] Animasyon error mesajları açıklayıcı mı?
- [ ] Animasyon error recovery çalışıyor mu?

**Framer Motion State Management:**

- [ ] Animasyon state'leri doğru yönetiliyor mu?
- [ ] Animasyon state geçişleri tutarlı mı?
- [ ] Animasyon state reset'leri çalışıyor mu?
- [ ] Animasyon state persistence çalışıyor mu?
- [ ] Animasyon state cleanup çalışıyor mu?

**Framer Motion Custom Hooks:**

- [ ] Custom animasyon hook'ları çalışıyor mu?
- [ ] Custom hook'lar reusable mı?
- [ ] Custom hook'lar performanslı mı?
- [ ] Custom hook'lar error handling yapıyor mu?
- [ ] Custom hook'lar TypeScript uyumlu mu?

**Framer Motion Testing:**

- [ ] Animasyon unit test'leri var mı?
- [ ] Animasyon integration test'leri var mı?
- [ ] Animasyon visual regression test'leri var mı?
- [ ] Animasyon performance test'leri var mı?
- [ ] Animasyon accessibility test'leri var mı?

**Framer Motion Documentation:**

- [ ] Animasyon kullanım dokümantasyonu var mı?
- [ ] Animasyon API dokümantasyonu var mı?
- [ ] Animasyon örnekleri var mı?
- [ ] Animasyon best practice'leri var mı?
- [ ] Animasyon troubleshooting guide'ı var mı?

### **🎨 Navigation Menu Theme Toggle Testleri:**

**Theme Toggle Temel Özellikleri:**

- [ ] Theme toggle butonu görünüyor mu?
- [ ] Theme toggle butonu tıklanabilir mi?
- [ ] Theme toggle butonu responsive mi?
- [ ] Theme toggle butonu accessible mi?
- [ ] Theme toggle butonu keyboard ile çalışıyor mu?

**Theme Toggle Fonksiyonları:**

- [ ] Light mode'dan dark mode'a geçiş çalışıyor mu?
- [ ] Dark mode'dan light mode'a geçiş çalışıyor mu?
- [ ] Theme değişimi anında uygulanıyor mu?
- [ ] Theme değişimi tüm sayfalarda tutarlı mı?
- [ ] Theme değişimi localStorage'a kaydediliyor mu?

**Theme Toggle UI/UX:**

- [ ] Theme toggle ikonu doğru gösteriliyor mu?
- [ ] Theme toggle animasyonu çalışıyor mu?
- [ ] Theme toggle hover efekti var mı?
- [ ] Theme toggle focus state'i var mı?
- [ ] Theme toggle active state'i var mı?

**Theme Toggle State Management:**

- [ ] Theme state doğru yönetiliyor mu?
- [ ] Theme state persistence çalışıyor mu?
- [ ] Theme state reset çalışıyor mu?
- [ ] Theme state sync çalışıyor mu?
- [ ] Theme state cleanup çalışıyor mu?

**Theme Toggle Performance:**

- [ ] Theme değişimi hızlı mı?
- [ ] Theme değişimi smooth mi?
- [ ] Theme değişimi CPU'yu yormuyor mu?
- [ ] Theme değişimi memory leak yaratmıyor mu?
- [ ] Theme değişimi battery drain yaratmıyor mu?

**Theme Toggle Accessibility:**

- [ ] Theme toggle screen reader uyumlu mu?
- [ ] Theme toggle keyboard navigation uyumlu mu?
- [ ] Theme toggle high contrast mode uyumlu mu?
- [ ] Theme toggle reduced motion uyumlu mu?
- [ ] Theme toggle ARIA labels var mı?

**Theme Toggle Cross-Browser:**

- [ ] Theme toggle Chrome'da çalışıyor mu?
- [ ] Theme toggle Firefox'ta çalışıyor mu?
- [ ] Theme toggle Safari'de çalışıyor mu?
- [ ] Theme toggle Edge'de çalışıyor mu?
- [ ] Theme toggle mobile browser'larda çalışıyor mu?

**Theme Toggle Cross-Device:**

- [ ] Theme toggle iPhone'da çalışıyor mu?
- [ ] Theme toggle Android'de çalışıyor mu?
- [ ] Theme toggle iPad'de çalışıyor mu?
- [ ] Theme toggle tablet'te çalışıyor mu?
- [ ] Theme toggle desktop'ta çalışıyor mu?

**Theme Toggle Error Handling:**

- [ ] Theme toggle error handling var mı?
- [ ] Theme toggle fallback mekanizması var mı?
- [ ] Theme toggle error recovery çalışıyor mu?
- [ ] Theme toggle error mesajları açıklayıcı mı?
- [ ] Theme toggle error boundary'leri çalışıyor mu?

**Theme Toggle Integration:**

- [ ] Theme toggle navigation ile entegre mi?
- [ ] Theme toggle layout ile entegre mi?
- [ ] Theme toggle components ile entegre mi?
- [ ] Theme toggle pages ile entegre mi?
- [ ] Theme toggle app ile entegre mi?

**Theme Toggle Testing:**

- [ ] Theme toggle unit test'leri var mı?
- [ ] Theme toggle integration test'leri var mı?
- [ ] Theme toggle visual regression test'leri var mı?
- [ ] Theme toggle performance test'leri var mı?
- [ ] Theme toggle accessibility test'leri var mı?

**Theme Toggle Documentation:**

- [ ] Theme toggle kullanım dokümantasyonu var mı?
- [ ] Theme toggle API dokümantasyonu var mı?
- [ ] Theme toggle örnekleri var mı?
- [ ] Theme toggle best practice'leri var mı?
- [ ] Theme toggle troubleshooting guide'ı var mı?

### **💾 Profile -> Veri Yönetim Sayfası Testleri:**

**Bulut Yedekleme Özellikleri:**

- [ ] Bulut yedekleme butonu görünüyor mu?
- [ ] Bulut yedekleme butonu tıklanabilir mi?
- [ ] Bulut yedekleme işlemi başlıyor mu?
- [ ] Bulut yedekleme progress bar'ı çalışıyor mu?
- [ ] Bulut yedekleme tamamlanıyor mu?
- [ ] Bulut yedekleme başarı mesajı gösteriliyor mu?
- [ ] Bulut yedekleme hata durumunda uyarı veriyor mu?
- [ ] Bulut yedekleme internet bağlantısı kontrolü yapıyor mu?
- [ ] Bulut yedekleme tüm verileri kapsıyor mu?
- [ ] Bulut yedekleme tarih damgası ekliyor mu?

**Veri Geri Yükleme Özellikleri:**

- [ ] Veri geri yükleme butonu görünüyor mu?
- [ ] Veri geri yükleme butonu tıklanabilir mi?
- [ ] Veri geri yükleme onay dialogu çıkıyor mu?
- [ ] Veri geri yükleme işlemi başlıyor mu?
- [ ] Veri geri yükleme progress bar'ı çalışıyor mu?
- [ ] Veri geri yükleme tamamlanıyor mu?
- [ ] Veri geri yükleme başarı mesajı gösteriliyor mu?
- [ ] Veri geri yükleme hata durumunda uyarı veriyor mu?
- [ ] Veri geri yükleme mevcut verileri koruyor mu?
- [ ] Veri geri yükleme çakışma kontrolü yapıyor mu?

**Bulut Verileri Temizleme Özellikleri:**

- [ ] Bulut verileri temizleme butonu görünüyor mu?
- [ ] Bulut verileri temizleme butonu tıklanabilir mi?
- [ ] Bulut verileri temizleme onay dialogu çıkıyor mu?
- [ ] Bulut verileri temizleme işlemi başlıyor mu?
- [ ] Bulut verileri temizleme progress bar'ı çalışıyor mu?
- [ ] Bulut verileri temizleme tamamlanıyor mu?
- [ ] Bulut verileri temizleme başarı mesajı gösteriliyor mu?
- [ ] Bulut verileri temizleme hata durumunda uyarı veriyor mu?
- [ ] Bulut verileri temizleme geri alınabilir mi?
- [ ] Bulut verileri temizleme tüm verileri siliyor mu?

**Hesabı Silme Özellikleri:**

- [ ] Hesabı silme butonu görünüyor mu?
- [ ] Hesabı silme butonu tıklanabilir mi?
- [ ] Hesabı silme onay dialogu çıkıyor mu?
- [ ] Hesabı silme uyarı mesajı gösteriliyor mu?
- [ ] Hesabı silme şifre doğrulaması istiyor mu?
- [ ] Hesabı silme işlemi başlıyor mu?
- [ ] Hesabı silme progress bar'ı çalışıyor mu?
- [ ] Hesabı silme tamamlanıyor mu?
- [ ] Hesabı silme başarı mesajı gösteriliyor mu?
- [ ] Hesabı silme hata durumunda uyarı veriyor mu?

**Veriler Bulutta Şifreleniyor mu:**

- [ ] Bulut verileri şifreleniyor mu?
- [ ] Şifreleme algoritması güvenli mi?
- [ ] Şifreleme anahtarları güvenli mi?
- [ ] Şifreleme end-to-end mi?
- [ ] Şifreleme performanslı mı?
- [ ] Şifreleme hata durumunda fallback var mı?
- [ ] Şifreleme key rotation çalışıyor mu?
- [ ] Şifreleme audit log'ları var mı?
- [ ] Şifreleme compliance uyumlu mu?
- [ ] Şifreleme documentation'ı var mı?

**Veri Yönetimi UI/UX:**

- [ ] Veri yönetimi sayfası responsive mi?
- [ ] Veri yönetimi sayfası accessible mi?
- [ ] Veri yönetimi sayfası loading state'leri var mı?
- [ ] Veri yönetimi sayfası error state'leri var mı?
- [ ] Veri yönetimi sayfası success state'leri var mı?
- [ ] Veri yönetimi sayfası confirmation dialog'ları var mı?
- [ ] Veri yönetimi sayfası progress indicator'ları var mı?
- [ ] Veri yönetimi sayfası tooltip'leri var mı?
- [ ] Veri yönetimi sayfası help text'leri var mı?
- [ ] Veri yönetimi sayfası keyboard navigation uyumlu mu?

**Veri Yönetimi Performance:**

- [ ] Bulut yedekleme hızlı mı?
- [ ] Veri geri yükleme hızlı mı?
- [ ] Bulut verileri temizleme hızlı mı?
- [ ] Hesabı silme hızlı mı?
- [ ] Şifreleme/şifre çözme hızlı mı?
- [ ] Network kullanımı optimize mi?
- [ ] CPU kullanımı optimize mi?
- [ ] Memory kullanımı optimize mi?
- [ ] Battery drain minimize mi?
- [ ] Background işlemler çalışıyor mu?

**Veri Yönetimi Security:**

- [ ] Kullanıcı authentication kontrolü var mı?
- [ ] Kullanıcı authorization kontrolü var mı?
- [ ] Session timeout kontrolü var mı?
- [ ] CSRF protection var mı?
- [ ] XSS protection var mı?
- [ ] SQL injection protection var mı?
- [ ] Input validation var mı?
- [ ] Output sanitization var mı?
- [ ] Rate limiting var mı?
- [ ] Audit logging var mı?

**Veri Yönetimi Error Handling:**

- [ ] Network error handling var mı?
- [ ] Server error handling var mı?
- [ ] Client error handling var mı?
- [ ] Timeout error handling var mı?
- [ ] Retry mechanism var mı?
- [ ] Fallback mechanism var mı?
- [ ] Error recovery var mı?
- [ ] Error reporting var mı?
- [ ] Error logging var mı?
- [ ] Error user feedback var mı?

**Veri Yönetimi Integration:**

- [ ] Cloud provider API entegrasyonu çalışıyor mu?
- [ ] Authentication service entegrasyonu çalışıyor mu?
- [ ] Database entegrasyonu çalışıyor mu?
- [ ] File storage entegrasyonu çalışıyor mu?
- [ ] Email service entegrasyonu çalışıyor mu?
- [ ] SMS service entegrasyonu çalışıyor mu?
- [ ] Analytics service entegrasyonu çalışıyor mu?
- [ ] Monitoring service entegrasyonu çalışıyor mu?
- [ ] Logging service entegrasyonu çalışıyor mu?
- [ ] Backup service entegrasyonu çalışıyor mu?

**Veri Yönetimi Testing:**

- [ ] Unit test'leri var mı?
- [ ] Integration test'leri var mı?
- [ ] End-to-end test'leri var mı?
- [ ] Security test'leri var mı?
- [ ] Performance test'leri var mı?
- [ ] Load test'leri var mı?
- [ ] Stress test'leri var mı?
- [ ] Penetration test'leri var mı?
- [ ] Vulnerability test'leri var mı?
- [ ] Compliance test'leri var mı?

**Veri Yönetimi Documentation:**

- [ ] API dokümantasyonu var mı?
- [ ] User guide var mı?
- [ ] Admin guide var mı?
- [ ] Troubleshooting guide var mı?
- [ ] FAQ var mı?
- [ ] Video tutorial'ları var mı?
- [ ] Screenshot'ları var mı?
- [ ] Code comments var mı?
- [ ] Architecture diagram'ları var mı?
- [ ] Security documentation'ı var mı?

### **Test Sonuçları Kaydı:**

Henüz bütün detaylar Test edilmedi

---

Testi Hazırlayan: Melih Can Demir - Full-Stack Software Developer, Generative AI, Senior Prompt Engineering

Mindhouse - Bilginin ve Zekânın Buluştuğu Yer
