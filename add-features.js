const fs = require('fs');

// Read original file
let html = fs.readFileSync('gazioglu-santiye-rapor-standalone.html', 'utf8');

// 1. Add copy button to materials - find and replace delete button section
const oldMaterialDelete = `<button onClick={() => setCurrentReport({ ...currentReport, materials: currentReport.materials.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"><Icon name="Trash2" size={12} /></button>`;

const newMaterialButtons = `<div className="absolute -top-2 -right-2 flex gap-1">
                                        <button onClick={() => {
                                            const copy = {...currentReport.materials[i]};
                                            setCurrentReport({ ...currentReport, materials: [...currentReport.materials, copy] });
                                            showToast('Montaj kopyalandı', 'success');
                                        }} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors" title="Kopyala">
                                            <Icon name="Copy" size={12} />
                                        </button>
                                        <button onClick={() => setCurrentReport({ ...currentReport, materials: currentReport.materials.filter((_, idx) => idx !== i) })} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors" title="Sil">
                                            <Icon name="Trash2" size={12} />
                                        </button>
                                    </div>`;

html = html.replace(oldMaterialDelete, newMaterialButtons);

// 2. Add Personnel button to header - find settings button and add personnel button before it
const oldHeaderButton = `<button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                            <Icon name="Settings" />
                        </button>
                    </header>`;

const newHeaderButtons = `<div className="flex gap-2">
                            <button onClick={() => setView('personnel')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Personel Yönetimi">
                                <Icon name="Users" />
                            </button>
                            <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Ayarlar">
                                <Icon name="Settings" />
                            </button>
                        </div>
                    </header>`;

html = html.replace(oldHeaderButton, newHeaderButtons);

// 3. Add Personnel Management View - insert before Preview view
const personnelView = `
            // Personnel Management View
            const PersonnelManagement = () => {
                const [newStaff, setNewStaff] = useState({ name: '', task: '', defaultStart: '08:00', defaultFinish: '17:00' });

                const handleAddStaff = () => {
                    if (!newStaff.name.trim() || !newStaff.task.trim()) {
                        showToast('İsim ve görev gereklidir', 'warning');
                        return;
                    }
                    const staffWithId = { ...newStaff, id: Date.now().toString() };
                    const updated = [...savedStaff, staffWithId];
                    setSavedStaff(updated);
                    localStorage.setItem('gazioglu_saved_staff', JSON.stringify(updated));
                    setNewStaff({ name: '', task: '', defaultStart: '08:00', defaultFinish: '17:00' });
                    showToast('Personel eklendi', 'success');
                };

                const handleDeleteStaff = (id) => {
                    if (confirm('Bu personeli silmek istediğine emin misin?')) {
                        const updated = savedStaff.filter(s => s.id !== id);
                        setSavedStaff(updated);
                        localStorage.setItem('gazioglu_saved_staff', JSON.stringify(updated));
                        showToast('Personel silindi', 'success');
                    }
                };

                const handleAddFromSaved = (staff) => {
                    setCurrentReport({
                        ...currentReport,
                        staff: [...currentReport.staff, {
                            name: staff.name,
                            task: staff.task,
                            startTime: staff.defaultStart,
                            finishTime: staff.defaultFinish,
                            location: ''
                        }]
                    });
                    showToast(\`\${staff.name} rapora eklendi\`, 'success');
                    setView('edit');
                };

                return (
                    <div className="min-h-screen bg-slate-50 pb-32">
                        <nav className="bg-white border-b px-4 py-6 sticky top-0 z-40 flex items-center justify-between shadow-sm">
                            <button onClick={() => setView('home')} className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                                <Icon name="ChevronLeft" size={28} />
                                <span className="font-bold text-sm">Geri</span>
                            </button>
                            <h2 className="font-black text-slate-800 uppercase italic">Personel Yönetimi</h2>
                            <div className="w-20"></div>
                        </nav>

                        <div className="p-4 max-w-2xl mx-auto space-y-6">
                            {/* Add New Staff */}
                            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Icon name="UserPlus" size={18} />
                                    <span className="font-black text-xs uppercase">Yeni Personel Ekle</span>
                                </div>
                                <FormInput 
                                    placeholder="Ad Soyad *" 
                                    value={newStaff.name} 
                                    onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                                />
                                <FormInput 
                                    placeholder="Görev *" 
                                    value={newStaff.task} 
                                    onChange={e => setNewStaff({...newStaff, task: e.target.value})} 
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput 
                                        type="time" 
                                        label="Varsayılan Giriş"
                                        value={newStaff.defaultStart} 
                                        onChange={e => setNewStaff({...newStaff, defaultStart: e.target.value})} 
                                    />
                                    <FormInput 
                                        type="time" 
                                        label="Varsayılan Çıkış"
                                        value={newStaff.defaultFinish} 
                                        onChange={e => setNewStaff({...newStaff, defaultFinish: e.target.value})} 
                                    />
                                </div>
                                <button onClick={handleAddStaff} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-blue-700 transition-colors">
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon name="Plus" size={20} />
                                        Personel Ekle
                                    </div>
                                </button>
                            </section>

                            {/* Saved Staff List */}
                            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <div className="flex items-center gap-2 text-blue-600 mb-4">
                                    <Icon name="Users" size={18} />
                                    <span className="font-black text-xs uppercase">Kayıtlı Personel ({savedStaff.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {savedStaff.length === 0 ? (
                                        <div className="text-center py-8 text-slate-300">
                                            <Icon name="Users" size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-bold text-sm">Henüz kayıtlı personel yok</p>
                                        </div>
                                    ) : (
                                        savedStaff.map(staff => (
                                            <div key={staff.id} className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-800">{staff.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{staff.task}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1">
                                                        {staff.defaultStart} - {staff.defaultFinish}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAddFromSaved(staff)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Rapora Ekle">
                                                        <Icon name="Plus" size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteStaff(staff.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Sil">
                                                        <Icon name="Trash2" size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                );
            };

`;

const previewMarker = '            const Preview = () => {';
html = html.replace(previewMarker, personnelView + previewMarker);

// 4. Add personnel route to main render
const oldRender = `{view === 'home' && <Home />}
                    {view === 'edit' && <Editor />}
                    {view === 'preview' && <Preview />}`;

const newRender = `{view === 'home' && <Home />}
                    {view === 'edit' && <Editor />}
                    {view === 'personnel' && <PersonnelManagement />}
                    {view === 'preview' && <Preview />}`;

html = html.replace(oldRender, newRender);

// Write new file
fs.writeFileSync('gazioglu-santiye-rapor-v2-FULL.html', html, 'utf8');

console.log('✅ Tam özellikli sürüm oluşturuldu: gazioglu-santiye-rapor-v2-FULL.html');
console.log('\n📋 Eklenen Özellikler:');
console.log('  1. ✅ Montaj kopyalama butonu (mavi kopyala ikonu)');
console.log('  2. ✅ Ana sayfada Personel Yönetimi butonu');
console.log('  3. ✅ Personel ekleme/silme ekranı');
console.log('  4. ✅ Kayıtlı personelden rapora hızlıca ekleme');
console.log('\n🎯 Kullanım:');
console.log('  - Ana sayfa → 👥 simgesi → Personel ekle');
console.log('  - Rapor düzenlerken → Montaj kartında 📋 kopyala butonu');
