# 🎉 APK Oluşturma Rehberi

Capacitor kurulumu tamamlandı! Android projesi hazır. Şimdi APK oluşturma adımları:

---

## 📱 Yöntem 1: Android Studio ile (ÖNERİLEN)

### 1. Android Studio'yu Aç
```bash
cd /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor
npx cap open android
```

Bu komut Android Studio'yu otomatik açacak.

### 2. Gradle Sync
- Android Studio açıldığında **otomatik olarak Gradle sync** başlayacak
- "Sync Now" yazarsa tıkla
- İlk sefer 5-10 dakika sürebilir (bağımlılıklar indiriliyor)

### 3. APK Build
**Debug APK (Test için):**
- Menü: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Oluşan APK yolu: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (Dağıtım için):**
- Menü: **Build → Generate Signed Bundle / APK**
- "APK" seç → Next
- Key oluştur (ilk kez) veya mevcut key'i seç
- Release APK yolu: `android/app/build/outputs/apk/release/app-release.apk`

### 4. APK'yı Telefonuna Yükle
```bash
# USB ile bağlı telefonuna yükle (USB debugging açık olmalı)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Veya APK'yı telefonuna gönder ve manuel kur
```

---

## ⚡ Yöntem 2: Komut Satırı ile (Hızlı)

### Debug APK Oluştur
```bash
cd /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor/android
./gradlew assembleDebug

# APK yolu:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK Oluştur
```bash
./gradlew assembleRelease

# APK yolu:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔧 İlk Kurulumda Gerekebilecekler

### Android Studio Yüklü Değilse
1. [Android Studio'yu İndir](https://developer.android.com/studio)
2. Java JDK otomatik gelecek
3. Android SDK otomatik yapılandırılacak

### USB Debugging Nasıl Açılır?
1. Telefon: **Ayarlar → Hakkında**
2. **Yapı numarası**na 7 kez dokun
3. **Ayarlar → Geliştirici Seçenekleri → USB Debugging** ✓

---

## 📦 Oluşan Dosyalar

```
gazioglu-santiye-rapor/
├── android/                    # Android Studio projesi
│   └── app/build/outputs/apk/
│       ├── debug/
│       │   └── app-debug.apk   # Test APK
│       └── release/
│           └── app-release.apk # Dağıtım APK
├── www/                        # Web kaynakları
├── package.json
└── capacitor.config.json
```

---

## ✅ Test Checklist

Uygulamayı telefonunda test ederken kontrol et:

- [ ] Rapor oluşturma
- [ ] Fotoğraf ekleme (kamera/galeri)
- [ ] Rapor kaydetme
- [ ] Rapor listeleme
- [ ] PDF export
- [ ] Offline çalışma (internet kapat, test et)
- [ ] Veri persistence (uygulamayı kapat-aç)

---

## 🚀 Sonraki Adımlar

**Şimdi yapılacaklar:**
1. `npx cap open android` ile Android Studio'yu aç
2. Gradle sync bekle
3. Build → Build APK
4. Test et! 🎉

**Sorun olursa:**
- Android Studio konsol çıktısını kontrol et
- `npx cap doctor` komutu ile diagnosis yap
