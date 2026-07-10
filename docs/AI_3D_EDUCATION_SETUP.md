# 🤖 AI Destekli 3D Eğitim Kurulum Rehberi

## 🚀 Özellikler

Bu sayfa **%100 AI destekli** 3D eğitim deneyimi sunar:

- **Gemini AI** ile 3D model üretimi
- **Three.js** ile interaktif 3D görselleştirme
- **Vercel Edge Functions** ile serverless backend
- **Real-time** 3D model oluşturma

## 📋 Kurulum Adımları

### 1. Gemini API Anahtarı

1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine git
2. Yeni API anahtarı oluştur
3. `.env.local` dosyası oluştur:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Gerekli Paketler

```bash
npm install three @types/three
```

### 3. Sayfa Erişimi

Sayfa `/ai-3d-education` adresinde erişilebilir.

## 🎯 Kullanım

### Prompt Örnekleri

- **"DNA sarmalı göster"** → 3D DNA modeli
- **"Atom yapısı"** → 3D atom modeli
- **"Hücre yapısı"** → 3D hücre modeli
- **"Kalp modeli"** → 3D kalp modeli

### 3D Kontroller

- **Mouse sol tık** → Modeli döndür
- **Mouse sağ tık** → Pan
- **Mouse wheel** → Zoom
- **Touch** → Mobil kontroller

## 🔧 Teknik Detaylar

### Frontend

- **React** + **TypeScript**
- **Three.js** 3D grafik kütüphanesi
- **Tailwind CSS** styling
- **Responsive** tasarım

### Backend

- **Vercel Edge Functions**
- **Gemini API** entegrasyonu
- **JSON** response parsing
- **Error handling**

### 3D Rendering

- **WebGL** tabanlı
- **Shadow mapping**
- **Anti-aliasing**
- **Orbit controls**

## 🌟 Özellikler

### AI Destekli

- **Gemini Pro** modeli
- **Natural language** prompt
- **Structured** JSON response
- **Educational** content

### 3D Görselleştirme

- **Interactive** modeller
- **Real-time** rendering
- **Custom** geometries
- **Material** system

### Eğitim Odaklı

- **Biyoloji** modelleri
- **Kimya** modelleri
- **Fizik** modelleri
- **Tıp** modelleri

## 🚨 Sorun Giderme

### Gemini API Hatası

- API anahtarını kontrol et
- Rate limit'i kontrol et
- Network bağlantısını kontrol et

### 3D Render Hatası

- WebGL desteğini kontrol et
- Browser'ı güncelle
- Hardware acceleration'ı etkinleştir

### Performance Sorunları

- Model karmaşıklığını azalt
- Texture boyutlarını küçült
- LOD (Level of Detail) ekle

## 🔮 Gelecek Geliştirmeler

- **VR/AR** desteği
- **Multi-user** collaboration
- **Advanced** AI models
- **Custom** 3D assets
- **Export** functionality

## 📚 Kaynaklar

- [Three.js Documentation](https://threejs.org/docs/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 🎉 Sonuç

Bu özellik **AI çağının** eğitim teknolojilerini gösterir:

- **Gemini AI** ile akıllı içerik üretimi
- **Three.js** ile modern 3D görselleştirme
- **Vercel** ile serverless deployment
- **React** ile responsive UI

**%100 AI destekli 3D eğitim deneyimi!** 🚀
