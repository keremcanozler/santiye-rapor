# 🌐 Gazioğlu Şantiye Rapor - Web Kullanımı

APK build işlemi network hızından dolayı uzun sürdü. İşte web versiyonunu kullanma rehberi:

## ✅ Anında Kullanım

### 1. Tarayıcıda Aç
HTML dosyasını tarayıcıda aç:
```bash
open /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor/gazioglu-santiye-rapor-standalone.html
```

veya Finder'dan dosyaya çift tıkla:
- Dosya yolu: `gazioglu-santiye-rapor/gazioglu-santiye-rapor-standalone.html`

### 2. Mobilde Kullan

**Seçenek A: PWA (Önerilen)**
1. HTML dosyasını bir web sunucusuna yükle (GitHub Pages, Netlify, vs.)
2. Telefonunda tarayıcıdan aç
3. **"Add to Home Screen"** / **"Ana Ekrana Ekle"** yap
4. Artık uygulama gibi çalışır!

**Seçenek B: Local Server**
Mac'inde basit bir sunucu çalıştır:
```bash
cd /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor
python3 -m http.server 8080
```

Sonra telefonundan:
- Mac'in IP adresini bul: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Telefonda: `http://[MAC_IP]:8080/gazioglu-santiye-rapor-standalone.html`
- iPhone/iPad Safari'de "Add to Home Screen"

---

## 📱 Özellikler (Web Versiyonu)

Tüm özellikler çalışıyor:
- ✅ Rapor oluşturma
- ✅ Fotoğraf yükleme
- ✅ LocalStorage (veriler tarayıcıda kalıyor)
- ✅ PDF export
- ✅ Offline çalışma
- ✅ Veri yedekleme/import

---

## 🚀 Gelecekte APK için

Network düzelince veya Android Studio kurduktan sonra APK build edebiliriz. Projede her şey hazır durumda.

---

## 💡 Hızlı Başlangıç

1. ✅ Dosya hazır: `gazioglu-santiye-rapor-standalone.html`
2. Çift tıkla veya Terminal'den `open` komutu
3. Kullanmaya başla! 🎉
