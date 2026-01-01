# ⚠️ APK Build Sorunu - Çözüm

## Sorun Tespit Edildi

Build başarısız oldu. İki ana sorun var:

### 1. ❌ Yanlış Java Versiyonu
**Kurulu:** Java 8 (1.8.0_471)  
**Gerekli:** Java 11 veya üstü (tercihen Java 17)

**Gradle hatası:**
```
Dependency requires at least JVM runtime version 11. 
This build uses a Java 8 JVM.
```

### 2. ⚠️ Network Bağlantı Sorunu
Gradle Maven repository'lerine erişemedi:
- `dl.google.com: nodename nor servname provided, or not known`
- `repo.maven.apache.org: nodename nor servname provided, or not known`

---

## ✅ Çözüm - Java 17 Kurulumu

### Terminal'de Çalıştır:

```bash
# Mevcut Java 8'i kaldır (isteğe bağlı)
# sudo rm -rf "/Library/Internet Plug-Ins/JavaAppletPlugin.plugin"

# Java 17 JDK indir ve kur
curl -L -o ~/Downloads/jdk17.dmg "https://download.oracle.com/java/17/latest/jdk-17_macos-aarch64_bin.dmg"
open ~/Downloads/jdk17.dmg
```

### Kurulum Sonrası Doğrulama:

```bash
# Java versiyonunu kontrol et
java -version
# Beklenen çıktı: java version "17.0.x"

# JAVA_HOME ayarla (gerekiyorsa)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

---

## 🔄 Alternatif: Gradle Build Dosyasını Güncelle

Eğer Java 17 kurmak istemezsen, Gradle'ı Java 8 ile uyumlu hale getirebilirim. Ama bu önerilmez çünkü:
- Eski kütüphaneler kullanmak gerekir
- Güvenlik açıkları olabilir
- Gelecekte sorun çıkabilir

---

## 📡 Network Sorununu Çöz

Eğer internet bağlantısı varsa:

```bash
# DNS ayarlarını kontrol et
# Sistem Ayarları → Network → WiFi → DNS

# Google DNS ekle: 8.8.8.8 ve 8.8.4.4
```

---

## 🚀 Java 17 Kurduktan Sonra

Bana **"Java 17 kurdum"** yaz, APK build'ini tekrar başlatırım!
