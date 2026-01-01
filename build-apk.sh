#!/bin/bash

# Gazioğlu Şantiye APK Build Script
# Java kurulumu ve APK build otomasyonu

echo "🔍 Java kontrolü yapılıyor..."
if ! command -v java &> /dev/null; then
    echo "❌ Java bulunamadı!"
    echo ""
    echo "📥 Java kurulumu gerekli. Lütfen aşağıdaki adımları takip et:"
    echo ""
    echo "1️⃣ Tarayıcını aç ve buraya git:"
    echo "   https://download.oracle.com/java/17/latest/jdk-17_macos-aarch64_bin.dmg"
    echo ""
    echo "2️⃣ İndirilen .dmg dosyasını aç ve kurulumu tamamla"
    echo ""
    echo "3️⃣ Kurulum bittikten sonra bu script'i tekrar çalıştır:"
    echo "   ./build-apk.sh"
    echo ""
    exit 1
fi

echo "✅ Java bulundu: $(java -version 2>&1 | head -1)"
echo ""
echo "🏗️ APK build başlatılıyor..."

cd android || exit 1
chmod +x gradlew

echo "📦 Gradle build çalışıyor (ilk kez 5-10 dakika sürebilir)..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 APK başarıyla oluşturuldu!"
    echo ""
    echo "📱 APK konumu:"
    APK_PATH="$(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    echo "   $APK_PATH"
    echo ""
    echo "📊 APK boyutu:"
    ls -lh "$APK_PATH" | awk '{print "   " $5}'
    echo ""
    echo "📲 Telefonuna yüklemek için:"
    echo "   adb install \"$APK_PATH\""
    echo ""
    echo "   veya APK'yı telefonuna gönder ve manuel kur"
else
    echo ""
    echo "❌ APK build başarısız oldu!"
    echo "Lütfen yukarıdaki hata mesajlarını kontrol et."
    exit 1
fi
