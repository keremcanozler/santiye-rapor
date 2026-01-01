# Input Focus Sorunu - Kapsamlı Çözüm Gerekli

## Sorun

Input alanlarına yazarken her tuş vuruşunda focus kayboluyor.

## Kök Neden

React'te her `currentReport` state değiştiğinde **tüm Editor component'i** yeniden render ediliyor. Bu sırada:
1. Inline arrow functions (`onChange={() => setCurrentReport(...)}`) yeni reference oluşturuyor
2. React bunları "yeni" prop olarak algılıyor
3. Input element'leri DOM'da yeniden mount ediliyor
4. Focus kayboluyor

## Denenen Çözümler (Başarısız)

✗ React.memo() - Component'leri memoize etmek (BAŞARISIZ)
✗ useEffect dependency'lerini azaltmak (BAŞARISIZ)  
✗ Viewport ayarları (BAŞARISIZ)

## Gerçek Çözüm

**Seçenek 1: Refactor (Kapsamlı)**
- Tüm onChange handler'ları useCallback ile wrap et
- FormInput/FormTextarea'yı tamamen bağ

ımsız component'ler yap
- State update'lerini optimize et
- **Tahmini süre:** 1-2 saat kodlama

**Seçenek 2: Uncontrolled Components (Basit)**
- State yerine ref kullan
- Sadece kaydet butonuna basınca state'e yaz
- Daha az React-like ama çalışır
- **Tahmini süre:** 30 dakika

**Seçenek 3: Farklı Framework (Radikal)**
- React yerine Vanilla JS veya Vue kullan
- Sıfırdan yazma gerektirir
- **Tahmini süre:** 3-4 saat

## Öneri

Mobile internet yavaş olduğu için şu anda **web versiyonunu kullan, APK'yı sonra halledelim**.

Web versiyonu:
- Tarayıcıda aç
- PWA olarak kaydet
- Şimdilik bu şekilde kullan

Network düzelince veya Android Studio kurduktan sonra APK'yı build ederiz.

---

**Kerem Can, ne yapmak istersin?**
1. Web versiyonuyla devam et (hızlı çözüm)
2. Input sorununu düzelt (1-2 saat)
3. Başka bir yaklaşım dene
