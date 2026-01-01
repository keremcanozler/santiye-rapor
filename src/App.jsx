import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// --- Icons Helper ---
// Note: We need to ensure lucide is available or install it. 
// Since the original used a script tag for lucide, we should probably install lucide-react or keep the script tag.
// For native performance, lucide-react is better.
// Let's assume we will install lucide-react.
// Actually, to minimize changes, let's keep the window.lucide approach for now or switch to lucide-react. 
// Switching to lucide-react is cleaner but requires changing all icon usages.
// The original code used `window.lucide.createIcons()`.
// Let's stick to the existing logic but maybe we can just import the icons we need if we have time.
// For now, let's keep it close to original but in a real React file.

// Wait, the original code used `window.lucide`. 
// I should probably install `lucide-react` and replace the Icon component to use imports.
// That would be much more performant than `createIcons()` which scans the DOM.
// But there are many icons.
// Strategy: Keep `window.lucide` for now, but load it via npm if possible or just keep the script tag in index.html (which is fine, it's just a library).
// Actually, `lucide` package exists.
// Let's try to use `lucide-react` for the generic Icon component if possible.
// But `lucide-react` exports individual components.
// The generic `Icon` component in current code does: `const LucideIcon = lucide[name] || lucide.HelpCircle;`
// We can achieve this by importing all icons from `lucide-react`? No, that's huge.
// Better: Install `lucide` (vanilla) and use it, or continue using the global `lucide` object?
// Let's continue using global `lucide` for now to save refactoring time, but we need to ensure it's loaded.
// Actually, I can just install `lucide-react` and map the names if I really want to optimize.
// But for "fastest solution", I will rely on `lucide` script in `index.html` (which I will keep for non-React libs like html2pdf) OR better, install them.
// Let's install `html2pdf.js` and `lucide` as dependencies.

const Icon = ({ name, size = 20, className = "" }) => {
    return <i data-lucide={name} className={className} style={{ width: size, height: size }}></i>;
};

const WEATHER_OPTIONS = [
    { id: 'gunesli', label: 'Güneşli', icon: 'Sun' },
    { id: 'bulutlu', label: 'Bulutlu', icon: 'Cloud' },
    { id: 'yagmurlu', label: 'Yağmurlu', icon: 'CloudRain' }, // Fixed icon name casing for Lucide
    { id: 'sisli', label: 'Sisli', icon: 'Wind' },
    { id: 'ruzgarli', label: 'Rüzgarlı', icon: 'Wind' },
    { id: 'firtina', label: 'Fırtına', icon: 'Wind' },
    { id: 'karli', label: 'Karlı', icon: 'Snowflake' },
    { id: 'dolu', label: 'Dolu', icon: 'CloudRain' },
];

const INITIAL_REPORT_STATE = {
    customer: 'BORUSAN',
    project: 'BORUSAN BORU',
    date: new Date().toISOString().split('T')[0],
    weather: 'gunesli',
    description: '',
    notes: '',
    materials: [],
    staff: [],
    photos: []
};

// --- Utility Functions ---
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

const validateReport = (report) => {
    const errors = [];

    if (!report.customer?.trim()) errors.push('Müşteri adı gereklidir');
    if (!report.project?.trim()) errors.push('Proje adı gereklidir');
    if (!report.date) errors.push('Tarih seçilmelidir');
    if (!report.description?.trim()) errors.push('Yapılan iş açıklaması gereklidir');

    return { isValid: errors.length === 0, errors };
};

const autoBackup = (data) => {
    try {
        const backupKey = `gazioglu_backup_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        localStorage.setItem('gazioglu_last_backup', new Date().toISOString());
    } catch (error) {
        console.error('Otomatik yedekleme başarısız:', error);
    }
};

// --- Reusable Components ---
const FormInput = React.memo(({ label, value, onChange, type = "text", placeholder, className = "" }) => {
    // Memoized & Uncontrolled
    return (
        <div className={className}>
            {label && <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{label}</label>}
            <input
                type={type}
                defaultValue={value}
                onBlur={(e) => {
                    if (e.target.value !== value) onChange(e);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                }}
                placeholder={placeholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-400"
            />
            {/* Removed transition-colors and content-visibility for raw performance */}
        </div>
    );
});

const FormTextarea = React.memo(({ label, value, onChange, rows = 4, placeholder }) => {
    // Memoized & Uncontrolled
    return (
        <div>
            {label && <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{label}</label>}
            <textarea
                rows={rows}
                defaultValue={value}
                onBlur={(e) => {
                    if (e.target.value !== value) onChange(e);
                }}
                placeholder={placeholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                className="w-full bg-slate-50 rounded-[1.5rem] p-5 text-sm font-medium outline-none border-2 border-transparent focus:border-blue-400"
            />
            {/* Removed transition-colors and content-visibility */}
        </div>
    );
});

const CorporateLogoBox = ({ customLogo }) => (
    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-slate-800 rounded-md w-full h-full min-h-[60px]">
        {customLogo ? (
            <img src={customLogo} alt="Logo" className="max-h-12 object-contain" />
        ) : (
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                    <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-[10px]">G</div>
                    <span className="text-slate-900 font-black text-xs tracking-tighter uppercase leading-none">GAZİOĞLU</span>
                </div>
                <div className="text-[8px] text-slate-500 font-bold tracking-[0.15em] uppercase leading-none">Endüstriyel</div>
            </div>
        )}
    </div>
);

const App = () => {
    const [view, setView] = useState('home');
    const [reports, setReports] = useState([]);
    const [currentReport, setCurrentReport] = useState(INITIAL_REPORT_STATE);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logo, setLogo] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [compressingPhotos, setCompressingPhotos] = useState(false);

    useEffect(() => {
        // Expose Native Bridge Function
        window.generatePDFFromNative = (data) => {
            setCurrentReport(prev => ({
                ...prev,
                ...data,
                // Ensure date string is valid or formatted
                date: data.date || prev.date
            }));

            // Wait for render, then render PDF
            setTimeout(() => {
                setView('preview-native');
            }, 100);
        };

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons({ icons: window.lucide.icons });
        }
    }, []);

    useEffect(() => {
        if (view === 'preview-native') {
            generatePDFForNative();
        }
    }, [view]);

    const generatePDFForNative = async () => {
        try {
            const element = document.getElementById('report-to-pdf');
            const opt = {
                margin: 0,
                filename: `Gazioglu_Rapor_${currentReport.date}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                }
            };

            // Generate PDF as base64 string
            const pdfBlob = await window.html2pdf().set(opt).from(element).output('blob');

            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);
            reader.onloadend = () => {
                const base64data = reader.result; // "data:application/pdf;base64,....."
                // Send back to Android
                if (window.Android && window.Android.onPDFCreated) {
                    window.Android.onPDFCreated(base64data);
                } else {
                    console.log("PDF Created (No Native Bridge):", base64data.substring(0, 50) + "...");
                }

                // Reset view or keep it?
                // setView('home'); 
            };

        } catch (error) {
            console.error("PDF Generation Failed", error);
        }
    };


    const saveToLocal = (data) => {
        try {
            localStorage.setItem('gazioglu_reports', JSON.stringify(data));
            setReports(data);

            // Auto backup every save
            if (data.length > 0) {
                autoBackup(data);
            }
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            showToast('Kaydetme başarısız! Depolama alanı dolu olabilir.', 'error');
            throw error;
        }
    };

    const handleSave = () => {
        // Validation
        const validation = validateReport(currentReport);
        if (!validation.isValid) {
            showToast(validation.errors[0], 'warning');
            return;
        }

        try {
            setSaving(true);
            const newReports = currentReport.id
                ? reports.map(r => r.id === currentReport.id ? currentReport : r)
                : [...reports, { ...currentReport, id: Date.now().toString() }];

            saveToLocal(newReports);
            showToast('Rapor başarıyla kaydedildi!', 'success');
            setTimeout(() => {
                setSaving(false);
                setView('home');
            }, 500);
        } catch (error) {
            setSaving(false);
            showToast('Kaydetme sırasında hata oluştu', 'error');
        }
    };

    const handleDelete = (id) => {
        if (confirm('Bu raporu silmek istediğine emin misin Kerem Can?')) {
            try {
                saveToLocal(reports.filter(r => r.id !== id));
                showToast('Rapor silindi', 'success');
            } catch (error) {
                showToast('Silme işlemi başarısız', 'error');
            }
        }
    };

    const handleExport = async () => {
        try {
            const dataStr = JSON.stringify(reports, null, 2);
            const fileName = `Gazioglu_Yedek_${new Date().toLocaleDateString('tr-TR')}.json`;

            // Check if running in Capacitor (APK)
            if (window.CapacitorCore && window.CapacitorCore.isNativePlatform()) {
                try {
                    // Convert JSON string to base64
                    const base64Data = btoa(unescape(encodeURIComponent(dataStr)));

                    // Save to Documents folder on Android
                    await window.CapFilesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: window.CapDirectory.Documents,
                        recursive: true
                    });

                    showToast('Yedek İndirilenler klasörüne kaydedildi!', 'success');
                    return;
                } catch (error) {
                    console.error('Capacitor export failed:', error);
                    showToast('Yedek kaydetme hatası', 'error');
                    return;
                }
            }

            // Browser fallback
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', fileName);
            link.click();
            showToast('Veriler dışarı aktarıldı', 'success');
        } catch (error) {
            showToast('Dışarı aktarma başarısız', 'error');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (Array.isArray(json)) {
                    saveToLocal([...reports, ...json]);
                    showToast(`${json.length} rapor başarıyla eklendi`, 'success');
                } else {
                    showToast('Hatalı dosya formatı', 'error');
                }
            } catch (err) {
                showToast('Dosya okunamadı: Geçersiz JSON formatı', 'error');
            }
        };
        reader.onerror = () => showToast('Dosya okuma hatası', 'error');
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm('⚠️ TÜM VERİLER SİLİNECEK!\n\nTüm raporlar, ayarlar ve logo silinecek. Bu işlem geri alınamaz!\n\nEmin misiniz?')) {
            try {
                localStorage.clear();
                showToast('Tüm veriler silindi', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                showToast('Veri silme hatası', 'error');
            }
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Lütfen bir görsel dosyası seçin', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                setLogo(reader.result);
                localStorage.setItem('gazioglu_corporate_logo', reader.result);
                showToast('Logo güncellendi', 'success');
            } catch (error) {
                showToast('Logo kaydedilemedi', 'error');
            }
        };
        reader.onerror = () => showToast('Logo yükleme hatası', 'error');
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setCompressingPhotos(true);
        const compressedPhotos = [];

        try {
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    showToast(`${file.name} bir görsel dosyası değil`, 'warning');
                    continue;
                }

                const compressed = await compressImage(file);
                compressedPhotos.push(compressed);
            }

            setCurrentReport(prev => ({
                ...prev,
                photos: [...prev.photos, ...compressedPhotos]
            }));

            showToast(`${compressedPhotos.length} fotoğraf eklendi`, 'success');
        } catch (error) {
            showToast('Fotoğraf yükleme hatası', 'error');
        } finally {
            setCompressingPhotos(false);
        }
    };

    const generatePDF = async () => {
        try {
            showToast('PDF oluşturuluyor...', 'info');
            const element = document.getElementById('report-to-pdf');
            const opt = {
                margin: 0,
                filename: `Gazioglu_Rapor_${currentReport.date}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                }
            };

            // Generate PDF as blob
            // Assuming html2pdf is available globally via script tag
            const pdfBlob = await window.html2pdf().set(opt).from(element).output('blob');
            const fileName = `Gazioglu_Rapor_${currentReport.date}.pdf`;

            // Check if running in Capacitor (APK)
            if (window.CapacitorCore && window.CapacitorCore.isNativePlatform()) {
                try {
                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(pdfBlob);
                    await new Promise((resolve, reject) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                    });

                    const base64Data = reader.result.split(',')[1];

                    // Save to Downloads folder on Android
                    await window.CapFilesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: window.CapDirectory.Documents,
                        recursive: true
                    });

                    showToast('PDF İndirilenler klasörüne kaydedildi!', 'success');
                    return;
                } catch (error) {
                    console.error('Capacitor save failed:', error);
                    showToast('PDF kaydetme hatası', 'error');
                    return;
                }
            }

            // Browser fallback: Try standard blob download
            try {
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                showToast('PDF indirildi!', 'success');
                return;
            } catch (err) {
                console.log('Blob download failed, trying data URI method');
            }

            // Final fallback: data URI method
            const reader = new FileReader();
            reader.onload = function () {
                const link = document.createElement('a');
                link.href = reader.result;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => document.body.removeChild(link), 100);
                showToast('PDF indirildi!', 'success');
            };
            reader.readAsDataURL(pdfBlob);

        } catch (error) {
            console.error('PDF Error:', error);
            showToast('PDF oluşturma hatası - PAYLAŞ butonunu deneyin', 'error');
        }
    };

    const sharePDF = async () => {
        try {
            showToast('PDF hazırlanıyor...', 'success');
            const element = document.getElementById('report-to-pdf');
            const opt = {
                margin: 0,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate PDF as blob
            const pdfBlob = await window.html2pdf().set(opt).from(element).output('blob');
            const fileName = `Gazioglu_Rapor_${currentReport.date}.pdf`;

            // Check if Web Share API is available
            if (navigator.share && navigator.canShare) {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Gazioğlu Rapor - ${currentReport.date}`,
                        text: `${currentReport.project} - Günlük İlerleme Raporu`,
                        files: [file]
                    });
                    showToast('Paylaşıldı!', 'success');
                } else {
                    // Fallback: create download link
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('PDF indirildi!', 'success');
                }
            } else {
                // Fallback for browsers without Share API
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('PDF indirildi!', 'success');
            }
        } catch (error) {
            console.error('Share Error:', error);
            showToast('Paylaşma hatası', 'error');
        }
    };

    // Simplified View Logic for Native Mode
    // If view is 'preview-native', show the report preview (hidden or visible for debug)
    // Otherwise show nothing (or a splash screen)

    if (view === 'preview-native') {
        return (
            <div className="bg-slate-50 min-h-screen">
                <Preview />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <p className="text-slate-400 font-bold animate-pulse">PDF Engine Ready</p>
            {/* The Preview component must be in DOM but hidden? No, we render it when requested. */}
        </div>
    );

    const Editor = () => (
        <div className="min-h-screen bg-slate-50 pb-32">
            <nav className="bg-white border-b px-4 py-6 sticky top-0 z-40 flex items-center justify-between shadow-sm">
                <button onClick={() => setView('home')} className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"><Icon name="arrow-left" size={28} /></button>
                <h2 className="font-black text-slate-800 uppercase italic">Editör</h2>
                <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-black uppercase shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {saving ? '...' : 'Kaydet'}
                </button>
            </nav>

            <div className="p-4 max-w-2xl mx-auto space-y-6">
                <section className={`bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 ${compressingPhotos ? 'compressing' : ''}`}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Icon name="Camera" size={18} /> <span className="font-black text-xs uppercase tracking-widest">Görseller</span>
                        </div>
                        <button onClick={() => document.getElementById('photo-up').click()} disabled={compressingPhotos} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50">
                            <Icon name={compressingPhotos ? "Loader" : "Plus"} />
                        </button>
                        <input type="file" id="photo-up" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                    {compressingPhotos && (
                        <p className="text-xs text-blue-600 font-bold text-center mb-3">Fotoğraflar sıkıştırılıyor...</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        {currentReport.photos.map((p, i) => (
                            <div key={i} className="aspect-square relative rounded-2xl overflow-hidden border">
                                <img src={p} className="w-full h-full object-cover" alt={`Fotoğraf ${i + 1}`} />
                                <button onClick={() => setCurrentReport({ ...currentReport, photos: currentReport.photos.filter((_, idx) => idx !== i) })} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"><Icon name="X" size={12} /></button>
                            </div>
                        ))}
                    </div>
                    {currentReport.photos.length === 0 && (
                        <div className="text-center py-8 text-slate-300 text-sm">
                            <Icon name="Image" size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Henüz fotoğraf eklenmedi</p>
                        </div>
                    )}
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600"><Icon name="Info" size={18} /> <span className="font-black text-xs uppercase">Rapor Bilgisi</span></div>
                    <FormInput
                        type="date"
                        value={currentReport.date}
                        onChange={e => setCurrentReport({ ...currentReport, date: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            placeholder="Müşteri *"
                            value={currentReport.customer}
                            onChange={e => setCurrentReport({ ...currentReport, customer: e.target.value })}
                        />
                        <FormInput
                            placeholder="Proje *"
                            value={currentReport.project}
                            onChange={e => setCurrentReport({ ...currentReport, project: e.target.value })}
                        />
                    </div>
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-4"><Icon name="Cloud" size={18} /> <span className="font-black text-xs uppercase">Hava Durumu</span></div>
                    <div className="grid grid-cols-4 gap-2">
                        {WEATHER_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => setCurrentReport({ ...currentReport, weather: opt.id })} className={`flex flex-col items-center p-4 rounded-[1.5rem] border-2 transition-all ${currentReport.weather === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-50 text-slate-300 hover:border-slate-200'}`}>
                                <Icon name={opt.icon} size={22} />
                                <span className="text-[9px] mt-2 font-black uppercase">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600"><Icon name="hard-hat" size={18} /> <span className="font-black text-xs uppercase">Yapılan İş *</span></div>
                    <FormTextarea
                        value={currentReport.description}
                        onChange={e => setCurrentReport({ ...currentReport, description: e.target.value })}
                        placeholder="Bugün neler yapıldı?"
                    />
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-600"><Icon name="Package" size={18} /> <span className="font-black text-xs uppercase">Montaj</span></div>
                        <button onClick={() => setCurrentReport({ ...currentReport, materials: [...currentReport.materials, { projectNo: '', assemblyNo: '', material: '', quantity: 0, unitWeight: 0, totalWeight: 0 }] })} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Icon name="Plus" /></button>
                    </div>
                    {currentReport.materials.map((m, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-[1.5rem] border relative space-y-3">
                            <div className="absolute -top-2 -right-2 flex gap-1">
                                <button onClick={() => {
                                    const copy = { ...m };
                                    const mats = [...currentReport.materials];
                                    mats.splice(i + 1, 0, copy);
                                    setCurrentReport({ ...currentReport, materials: mats });
                                    showToast('Montaj kopyalandı', 'success');
                                }} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"><Icon name="Copy" size={12} /></button>
                                <button onClick={() => setCurrentReport({ ...currentReport, materials: currentReport.materials.filter((_, idx) => idx !== i) })} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"><Icon name="Trash2" size={12} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput placeholder="Proje No" value={m.projectNo} onChange={e => {
                                    const mats = [...currentReport.materials]; mats[i].projectNo = e.target.value; setCurrentReport({ ...currentReport, materials: mats });
                                }} />
                                <FormInput placeholder="Montaj No" value={m.assemblyNo} onChange={e => {
                                    const mats = [...currentReport.materials]; mats[i].assemblyNo = e.target.value; setCurrentReport({ ...currentReport, materials: mats });
                                }} />
                            </div>
                            <FormInput placeholder="Malzeme" value={m.material} onChange={e => {
                                const mats = [...currentReport.materials]; mats[i].material = e.target.value; setCurrentReport({ ...currentReport, materials: mats });
                            }} />
                            <div className="grid grid-cols-3 gap-2">
                                <FormInput type="number" placeholder="Adet" value={m.quantity || ''} onChange={e => {
                                    const mats = [...currentReport.materials];
                                    mats[i].quantity = Number(e.target.value);
                                    mats[i].totalWeight = mats[i].quantity * mats[i].unitWeight;
                                    setCurrentReport({ ...currentReport, materials: mats });
                                }} />
                                <FormInput type="number" placeholder="Birim Kg" value={m.unitWeight || ''} onChange={e => {
                                    const mats = [...currentReport.materials];
                                    mats[i].unitWeight = Number(e.target.value);
                                    mats[i].totalWeight = mats[i].quantity * mats[i].unitWeight;
                                    setCurrentReport({ ...currentReport, materials: mats });
                                }} />
                                <div className="bg-blue-600 text-white text-[10px] p-3 rounded-xl flex items-center justify-center font-black">{(m.totalWeight || 0).toFixed(1)} KG</div>
                            </div>
                        </div>
                    ))}
                    {currentReport.materials.length === 0 && (
                        <div className="text-center py-8 text-slate-300 text-sm">
                            <Icon name="Package" size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Montaj kaydı eklenmedi</p>
                        </div>
                    )}
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-600"><Icon name="Users" size={18} /> <span className="font-black text-xs uppercase">Personel</span></div>
                        <button onClick={() => setCurrentReport({ ...currentReport, staff: [...currentReport.staff, { name: '', task: '', startTime: '08:00', finishTime: '17:00', location: '' }] })} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Icon name="Plus" /></button>
                    </div>
                    {currentReport.staff.map((s, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-[1.5rem] border relative space-y-3">
                            <button onClick={() => setCurrentReport({ ...currentReport, staff: currentReport.staff.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"><Icon name="Trash2" size={12} /></button>
                            <FormInput placeholder="Ad Soyad" value={s.name} onChange={e => {
                                const stf = [...currentReport.staff]; stf[i].name = e.target.value; setCurrentReport({ ...currentReport, staff: stf });
                            }} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput type="time" value={s.startTime} onChange={e => {
                                    const stf = [...currentReport.staff]; stf[i].startTime = e.target.value; setCurrentReport({ ...currentReport, staff: stf });
                                }} />
                                <FormInput type="time" value={s.finishTime} onChange={e => {
                                    const stf = [...currentReport.staff]; stf[i].finishTime = e.target.value; setCurrentReport({ ...currentReport, staff: stf });
                                }} />
                            </div>
                        </div>
                    ))}
                    {currentReport.staff.length === 0 && (
                        <div className="text-center py-8 text-slate-300 text-sm">
                            <Icon name="Users" size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Personel kaydı eklenmedi</p>
                        </div>
                    )}
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600"><Icon name="sticky-note" size={18} /> <span className="font-black text-xs uppercase">Notlar</span></div>
                    <FormTextarea
                        rows={3}
                        value={currentReport.notes}
                        onChange={e => setCurrentReport({ ...currentReport, notes: e.target.value })}
                        placeholder="Ekstra notlar..."
                    />
                </section>
            </div>
        </div>
    );

    const Preview = () => {
        const totalWeight = currentReport.materials.reduce((sum, m) => sum + (m.totalWeight || 0), 0);
        return (
            <div className="min-h-screen bg-slate-900 pb-20 overflow-x-hidden">
                <nav className="bg-white border-b px-4 py-6 sticky top-0 z-50 flex items-center justify-between">
                    <button onClick={() => setView('home')} className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"><Icon name="arrow-left" size={28} /></button>
                    <div className="flex gap-2">
                        <button onClick={sharePDF} className="bg-green-600 text-white px-6 py-3 rounded-[1.2rem] text-xs font-black flex items-center gap-2 shadow-lg hover:bg-green-700 transition-colors">
                            <Icon name="share-2" size={18} /> PAYLAŞ
                        </button>
                        <button onClick={generatePDF} className="bg-blue-600 text-white px-6 py-3 rounded-[1.2rem] text-xs font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors">
                            <Icon name="file-down" size={18} /> PDF İNDİR
                        </button>
                    </div>
                </nav>

                <div className="p-0 md:p-12 flex justify-center">
                    <div id="report-to-pdf" className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl flex flex-col box-border">
                        <div className="border-[1.5pt] border-black h-full flex flex-col">
                            <div className="grid grid-cols-12 border-b-[1.5pt] border-black bg-slate-50">
                                <div className="col-span-8 p-5 border-r-[1.5pt] border-black flex items-center justify-center text-center">
                                    <h1 className="text-xl font-black uppercase tracking-tighter leading-tight italic">GÜNLÜK İLERLEME RAPORU / DAILY PROGRESS REPORT</h1>
                                </div>
                                <div className="col-span-4 p-4 flex items-center justify-center bg-white text-center">
                                    <CorporateLogoBox customLogo={logo} />
                                </div>
                            </div>

                            <div className="grid grid-cols-12 border-b border-black text-[9px]">
                                <div className="col-span-2 p-2 border-r border-black font-black bg-slate-100">MÜŞTERİ:</div>
                                <div className="col-span-4 p-2 border-r border-black font-bold uppercase">{currentReport.customer}</div>
                                <div className="col-span-2 p-2 border-r border-black font-black bg-slate-100">TARİH:</div>
                                <div className="col-span-4 p-2 font-black">{new Date(currentReport.date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-black text-[9px]">
                                <div className="col-span-2 p-2 border-r border-black font-black bg-slate-100">PROJE:</div>
                                <div className="col-span-10 p-2 font-bold uppercase">{currentReport.project}</div>
                            </div>

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">HAVA DURUMU</div>
                            <div className="grid grid-cols-4 border-b border-black">
                                {WEATHER_OPTIONS.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2 p-2 border-r last:border-r-0 border-black text-[8px] font-bold uppercase">
                                        <div className={`w-3.5 h-3.5 border border-black flex items-center justify-center ${currentReport.weather === opt.id ? 'bg-black text-white' : ''}`}>
                                            {currentReport.weather === opt.id ? '✓' : ''}
                                        </div>
                                        <span>{opt.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">YAPILAN İŞİN AÇIKLANMASI</div>
                            <div className="p-4 min-h-[140px] text-[11px] font-medium whitespace-pre-wrap border-b border-black leading-relaxed italic bg-white flex-grow">
                                {currentReport.description || 'Açıklama girilmedi.'}
                            </div>

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">SAHA FOTOĞRAFLARI</div>
                            <div className="p-2 grid grid-cols-3 gap-2 border-b border-black bg-white">
                                {currentReport.photos.length > 0 ? currentReport.photos.map((p, i) => (
                                    <div key={i} className="aspect-square border border-slate-200 overflow-hidden"><img src={p} className="w-full h-full object-cover" alt={`Saha ${i + 1}`} /></div>
                                )) : <div className="col-span-3 text-[9px] text-center py-8 text-slate-300">FOTOĞRAF EKLENMEDİ</div>}
                            </div>

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">MONTAJ DETAYLARI</div>
                            <div className="grid grid-cols-12 border-b border-black bg-slate-100 text-[8px] font-black text-center uppercase">
                                <div className="col-span-2 p-1 border-r border-black">PROJE NO</div>
                                <div className="col-span-2 p-1 border-r border-black">MONTAJ NO</div>
                                <div className="col-span-4 p-1 border-r border-black">MALZEME</div>
                                <div className="col-span-1 p-1 border-r border-black">ADET</div>
                                <div className="col-span-1 p-1 border-r border-black">BİRİM</div>
                                <div className="col-span-2 p-1 font-black">TOPLAM</div>
                            </div>
                            {currentReport.materials.length > 0 ? currentReport.materials.map((m, i) => (
                                <div key={i} className="grid grid-cols-12 border-b border-black text-[8px] text-center font-bold">
                                    <div className="col-span-2 p-1 border-r border-black">{m.projectNo}</div>
                                    <div className="col-span-2 p-1 border-r border-black">{m.assemblyNo}</div>
                                    <div className="col-span-4 p-1 border-r border-black text-left pl-2 uppercase">{m.material}</div>
                                    <div className="col-span-1 p-1 border-r border-black">{m.quantity}</div>
                                    <div className="col-span-1 p-1 border-r border-black">{m.unitWeight}</div>
                                    <div className="col-span-2 p-1 font-black">{(m.totalWeight || 0).toFixed(1)}</div>
                                </div>
                            )) : (
                                <div className="col-span-12 text-[9px] text-center py-4 border-b border-black text-slate-300">MONTAJ KAYDI YOK</div>
                            )}
                            <div className="grid grid-cols-12 bg-slate-50 font-black text-[10px] border-b border-black p-2 italic">
                                <div className="col-span-10 text-right pr-6 uppercase tracking-wider">TOPLAM AĞIRLIK (Kg) :</div>
                                <div className="col-span-2 text-center text-blue-800">{totalWeight.toLocaleString('tr-TR')}</div>
                            </div>

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">PERSONEL DETAYI</div>
                            <div className="grid grid-cols-12 border-b border-black bg-slate-100 text-[8px] font-black text-center uppercase">
                                <div className="col-span-4 p-1 border-r border-black">AD SOYAD</div>
                                <div className="col-span-2 p-1 border-r border-black">GÖREV</div>
                                <div className="col-span-2 p-1 border-r border-black">GİRİŞ</div>
                                <div className="col-span-2 p-1 border-r border-black">ÇIKIŞ</div>
                                <div className="col-span-2 p-1">MEVKİ</div>
                            </div>
                            {currentReport.staff.length > 0 ? currentReport.staff.map((s, i) => (
                                <div key={i} className="grid grid-cols-12 border-b border-black text-[8px] text-center font-bold uppercase italic py-1">
                                    <div className="col-span-4 p-1 border-r border-black text-left pl-2">{s.name}</div>
                                    <div className="col-span-2 p-1 border-r border-black">{s.task}</div>
                                    <div className="col-span-2 p-1 border-r border-black font-black">{s.startTime}</div>
                                    <div className="col-span-2 p-1 border-r border-black font-black">{s.finishTime}</div>
                                    <div className="col-span-2 p-1">{s.location}</div>
                                </div>
                            )) : (
                                <div className="col-span-12 text-[9px] text-center py-4 border-b border-black text-slate-300">PERSONEL KAYDI YOK</div>
                            )}

                            <div className="p-1 font-black text-[9px] bg-slate-200 border-b border-black uppercase text-center italic">NOTLAR</div>
                            <div className="p-3 min-h-[60px] text-[10px] font-medium whitespace-pre-wrap border-b border-black italic leading-tight bg-white">
                                {currentReport.notes || '-'}
                            </div>

                            <div className="grid grid-cols-3 min-h-[140px] text-[9px] bg-white border-t border-black flex-grow">
                                <div className="p-4 border-r border-black flex flex-col justify-between italic">
                                    <span className="font-black underline uppercase tracking-widest text-[8px]">Hazırlayan / Prepared:</span>
                                    <div className="text-center mt-6">
                                        <p className="font-black text-[10px] uppercase italic leading-none">Kerem Can Özler</p>
                                        <p className="text-[7px] font-bold italic opacity-60 mt-1 uppercase">Saha Mimarı / Site Architect</p>
                                    </div>
                                </div>
                                <div className="p-4 border-r border-black font-black underline uppercase tracking-widest text-[8px] italic">Kontrol / Checked:</div>
                                <div className="p-4 font-black underline uppercase tracking-widest text-[8px] italic">Onay / Approved:</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans antialiased">
            {view === 'home' && <Home />}
            {view === 'edit' && <Editor />}
            {view === 'preview' && <Preview />}
        </div>
    );
};

export default App;
