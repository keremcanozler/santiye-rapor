# Node.js Kurulum Rehberi (macOS)

Gazioğlu Şantiye Rapor uygulamasını APK'ya dönüştürebilmek için **Node.js** gereklidir.

## ✅ En Kolay Yöntem: Homebrew ile Kurulum

```bash
# 1. Homebrew'i kontrol et (yoksa kur)
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js kur
brew install node

# 3. Kurulumu doğrula
node --version
npm --version
```

**Kurulum Süresi:** ~5-10 dakika

---

## 🔄 Alternatif: NVM ile Kurulum

```bash
# 1. NVM kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Terminal'i yeniden başlat veya:
source ~/.zshrc

# 3. Node.js yükle (LTS sürüm)
nvm install --lts
nvm use --lts

# 4. Doğrula
node --version
npm --version
```

---

## 📦 Kurulum Sonrası

Node.js kurduktan sonra şu komutları çalıştırmanız gerekiyor:

```bash
cd /Users/keremcanozler/.gemini/antigravity/scratch/gazioglu-santiye-rapor

# NPM paketlerini yükle
npm install

# Capacitor başlat
npx cap add android

# Android Studio'da aç
npx cap open android
```

---

## ❓ Hangi Yöntemi Seçmeliyim?

- **Homebrew (Önerilen)**: Daha basit, tek komutla kurulum
- **NVM**: Birden fazla Node.js versiyonu kullanmak istiyorsan

---

## 🚀 Sonraki Adım

Node.js kurduktan sonra bana haber ver, kaldığımız yerden devam edelim!
