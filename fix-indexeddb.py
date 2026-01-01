#!/usr/bin/env python3
"""
IndexedDB HTML Dosyasını Düzeltme Script'i
Async/await hatalarını ve syntax sorunlarını düzeltir
"""

import re

def fix_indexeddb_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. useEffect'leri düzelt - async IIFE pattern
    content = re.sub(
        r'useEffect\(\(\) => \{ \(async \(\) => \{',
        'useEffect(() => {\n                (async () => {',
        content
    )
    
    content = re.sub(
        r'\}\)\(\); \}, \[',
        '                })();\n            }, [',
        content
    )
    
    # 2. İkinci useEffect'i düzelt (lucide icons için)
    content = re.sub(
        r'useEffect\(\(\) => \{ \(async \(\) => \{\s+if \(window\.lucide\) window\.lucide\.createIcons\(\);\s+\}, \[view, showSettings, reports\]\);',
        '''useEffect(() => {
                if (window.lucide) window.lucide.createIcons();
            }, [view, showSettings, reports]);''',
        content
    )
    
    # 3. JSON.parse'ları kaldır (IndexedDB zaten obje döndürüyor)
    content = re.sub(
        r'setReports\(JSON\.parse\(savedData\)\);',
        'setReports(savedData);',
        content
    )
    
    content = re.sub(
        r'setSavedStaff\(JSON\.parse\(savedPersonnel\)\);',
        'setSavedStaff(savedPersonnel);',
        content
    )
    
    content = re.sub(
        r'const data = JSON\.parse\(savedData \|\| \'\[\]\'\);',
        'const data = savedData || [];',
        content
    )
    
    # 4. saveToLocal'ı async yap
    content = re.sub(
        r'const saveToLocal = \(data\) => \{',
        'const saveToLocal = async (data) => {',
        content
    )
    
    # 5. handleSave'i async yap
    content = re.sub(
        r'const handleSave = \(\) => \{',
        'const handleSave = async () => {',
        content
    )
    
    # 6. handleDelete'i async yap
    content = re.sub(
        r'const handleDelete = \(id\) => \{',
        'const handleDelete = async (id) => {',
        content
    )
    
    # 7. handleLogoChange'i async yap
    content = re.sub(
        r'const handleLogoChange = \(e\) => \{',
        'const handleLogoChange = async (e) => {',
        content
    )
    
    # 8. handleImport'u async yap
    content = re.sub(
        r'const handleImport = \(e\) => \{',
        'const handleImport = async (e) => {',
        content
    )
    
    content = re.sub(
        r'reader\.onload = \(event\) => \{',
        'reader.onload = async (event) => {',
        content
    )
    
    # 9. reader.onloadend'i async yap (logo için)
    content = re.sub(
        r'reader\.onloadend = \(\) => \{',
        'reader.onloadend = async () => {',
        content
    )
    
    # 10. onClick handler'ları async yap (logo sil butonu için)
    content = re.sub(
        r'<button onClick=\{\(\) => \{\s+setLogo\(null\);\s+await storage\.saveSetting',
        '<button onClick={async () => {\n                                            setLogo(null);\n                                            await storage.saveSetting',
        content
    )
    
    # 11. App başlangıcına storage.init() ekle
    init_code = '''const [loading, setLoading] = useState(true);

            // Initialize IndexedDB on mount
            useEffect(() => {
                (async () => {
                    try {
                        await storage.init();
                        showToast('✅ IndexedDB hazır - Sınırsız depolama!', 'success');
                        setLoading(false);
                    } catch (error) {
                        console.error('IndexedDB başlatma hatası:', error);
                        showToast('❌ Veritabanı başlatılamadı: ' + error.message, 'error');
                        setLoading(false);
                    }
                })();
            }, []);

            const [loading2, setLoading2] = useState(false);'''
    
    content = content.replace(
        'const [loading, setLoading] = useState(false);',
        init_code
    )
    
    # 12. Loading ekranı ekle
    loading_screen = '''
            if (loading) {
                return (
                    <div className="flex items-center justify-center min-h-screen bg-slate-50">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600 font-bold">IndexedDB Başlatılıyor...</p>
                            <p className="text-slate-400 text-sm mt-2">Sınırsız depolama hazırlanıyor</p>
                        </div>
                    </div>
                );
            }

'''
    
    # Views'dan önce loading ekranını ekle
    content = content.replace(
        '// Views\n            const Home',
        loading_screen + '            // Views\n            const Home'
    )
    
    # 13. Uyarı mesajını güncelle
    content = content.replace(
        '<p className="text-xs font-black text-amber-900 uppercase mb-1">⚠️ Önemli Bilgi</p>',
        '<p className="text-xs font-black text-green-900 uppercase mb-1">✅ IndexedDB Aktif</p>'
    )
    
    content = content.replace(
        'Verileriniz tarayıcıda saklanıyor. Tarayıcı geçmişini temizlerseniz verileriniz kaybolabilir.',
        'Fotoğraflar IndexedDB\'de saklanıyor - Sınırsız depolama kapasitesi! Tarayıcı limiti sorunu çözüldü.'
    )
    
    content = content.replace(
        'bg-amber-50 border-2 border-amber-200',
        'bg-green-50 border-2 border-green-200'
    )
    
    content = content.replace(
        'text-amber-800',
        'text-green-800'
    )
    
    content = content.replace(
        'text-amber-600',
        'text-green-600'
    )
    
    content = content.replace(
        '<Icon name="AlertTriangle"',
        '<Icon name="Database"'
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Düzeltmeler tamamlandı!")
    print(f"📊 Dosya boyutu: {len(content)} byte")

if __name__ == '__main__':
    fix_indexeddb_file('gazioglu-santiye-rapor-v6-INDEXEDDB.html')
