# Java JDK Kurulum Rehberi - APK Build İçin Gerekli

APK oluşturmak için Java JDK gerekli. İşte en hızlı kurulum yöntemi:

## ⚡ Hızlı Kurulum (5 dakika)

### 1. Java JDK İndir
[Oracle JDK 17 - macOS ARM64 (M1/M2/M3)](https://download.oracle.com/java/17/latest/jdk-17_macos-aarch64_bin.dmg)

veya

[Oracle JDK 17 - macOS Intel](https://download.oracle.com/java/17/latest/jdk-17_macos-x64_bin.dmg)

### 2. Kur
- İndirilen .dmg dosyasını aç
- Kurulum sihirbazını takip et
- Şifre iste, gir

### 3. Doğrula
Terminal'de:
```bash
java -version
```

Çıktı şuna benzer olmalı:
```
java version "17.0.x"
```

### 4. Bana Haber Ver
"kurdum" yaz, APK build'i hemen başlatırım! 🚀

---

## 📱 APK Build Sonrası

Java kurulunca şunu çalıştıracağım:
```bash
cd /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor/android
./gradlew assembleDebug
```

APK yolu: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ❓ Alternatif Çözümler

**Eğer Java kurmak istemezsen:**

1. **Android Studio kur** - Java otomatik gelir, GUI ile build edersin
2. **Online APK builder** - Projeyi zip'le, online servise yükle (daha riskli)

**En kolayı:** Java'yı kur, ben APK'yı build edeyim!
