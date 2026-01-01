const fs = require('fs');

// Read current file
let html = fs.readFileSync('gazioglu-santiye-rapor-v3-FIXED.html', 'utf8');

// 1. Add search state
html = html.replace(
    'const [savedStaff, setSavedStaff] = useState([]);',
    `const [savedStaff, setSavedStaff] = useState([]);
            const [searchQuery, setSearchQuery] = useState('');`
);

// 2. Add search box to Home view - after header
const searchBox = `
                    {/* Search Box */}
                    <div className="mb-6">
                        <div className="relative">
                            <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rapor ara (tarih, müşteri, proje)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-medium outline-none focus:border-blue-400 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Icon name="X" size={16} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>
`;

html = html.replace(
    `{showSettings && (`,
    searchBox + `                    {showSettings && (`
);

// 3. Update report filtering logic
html = html.replace(
    `reports.sort((a, b) => new Date(b.date) - new Date(a.date)).map(report =>`,
    `reports
                                .filter(report => {
                                    if (!searchQuery.trim()) return true;
                                    const q = searchQuery.toLowerCase();
                                    return (
                                        report.customer?.toLowerCase().includes(q) ||
                                        report.project?.toLowerCase().includes(q) ||
                                        new Date(report.date).toLocaleDateString('tr-TR').includes(q)
                                    );
                                })
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(report =>`
);

// 4. Add quick date buttons to Editor
const quickDateButtons = `
                            <div className="flex gap-2 mb-3">
                                <button onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setCurrentReport({ ...currentReport, date: today });
                                }} className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors">
                                    BUGÜN
                                </button>
                                <button onClick={() => {
                                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                                    setCurrentReport({ ...currentReport, date: yesterday });
                                }} className="flex-1 bg-slate-50 text-slate-600 py-2 px-3 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors">
                                    DÜN
                                </button>
                                <button onClick={() => {
                                    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
                                    setCurrentReport({ ...currentReport, date: threeDaysAgo });
                                }} className="flex-1 bg-slate-50 text-slate-600 py-2 px-3 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors">
                                    3 GÜN ÖNCE
                                </button>
                            </div>`;

html = html.replace(
    `<div className="flex items-center gap-2 text-blue-600"><Icon name="Info" size={18} /> <span className="font-black text-xs uppercase">Rapor Bilgisi</span></div>
                            <FormInput
                                type="date"`,
    `<div className="flex items-center gap-2 text-blue-600"><Icon name="Info" size={18} /> <span className="font-black text-xs uppercase">Rapor Bilgisi</span></div>
                            ${quickDateButtons}
                            <FormInput
                                type="date"`
);

// 5. Add copy button to report cards
html = html.replace(
    `<button onClick={() => { setCurrentReport(report); setView('edit'); }} className="p-4 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"><Icon name="Pencil" /></button>`,
    `<button onClick={() => { setCurrentReport(report); setView('edit'); }} className="p-4 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors" title="Düzenle"><Icon name="Pencil" /></button>
                                        <button onClick={() => {
                                            const newReport = {
                                                ...report,
                                                id: null,
                                                date: new Date().toISOString().split('T')[0]
                                            };
                                            setCurrentReport(newReport);
                                            setView('edit');
                                            showToast('Rapor kopyalandı, tarih bugüne ayarlandı', 'success');
                                        }} className="p-4 text-green-600 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors" title="Kopyala"><Icon name="Copy" /></button>`
);

// Write updated file
fs.writeFileSync('gazioglu-santiye-rapor-v4-ENHANCED.html', html, 'utf8');

console.log('✅ En önemli 3 özellik eklendi: gazioglu-santiye-rapor-v4-ENHANCED.html');
console.log('\n📋 Eklenen Özellikler:');
console.log('  1. 🔍 Rapor Arama - Tarih/müşteri/proje ara');
console.log('  2. ⚡ Hızlı Tarih - Bugün, Dün, 3 Gün Önce butonları');
console.log('  3. 📋 Rapor Kopyala - Yeşil kopyala butonu (tarih bugüne ayarlanır)');
console.log('\n🎯 Kullanım:');
console.log('  - Ana sayfa → 🔍 Arama kutusuna yaz');
console.log('  - Rapor düzenle → Tarih üstünde hızlı butonlar');
console.log('  - Rapor kartı → Yeşil 📋 butonu → Kopyala');
