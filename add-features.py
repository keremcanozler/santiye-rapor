#!/usr/bin/env python3
"""
Add Personnel Management and Assembly Copy features to Gazioglu app
"""

import re

# Read the current HTML file
with open('gazioglu-santiye-rapor-standalone.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# 1. Add savedStaff state (already done manually, but ensure it's there)
if 'useState([]);' not in html_content or 'savedStaff' not in html_content:
    # Find the compressingPhotos state line
    html_content = html_content.replace(
        "const [compressingPhotos, setCompressingPhotos] = useState(false);",
        "const [compressingPhotos, setCompressingPhotos] = useState(false);\n            const [savedStaff, setSavedStaff] = useState([]);"
    )

# 2. Add localStorage loading for savedStaff (already done)
if 'gazioglu_saved_staff' not in html_content:
    # Add after logo loading
    logo_section = """const savedLogo = localStorage.getItem('gazioglu_corporate_logo');
                    if (savedLogo) {
                        setLogo(savedLogo);
                    }"""
    
    replacement = logo_section + """

                    const savedPersonnel = localStorage.getItem('gazioglu_saved_staff');
                    if (savedPersonnel) {
                        setSavedStaff(JSON.parse(savedPersonnel));
                    }"""
    
    html_content = html_content.replace(logo_section, replacement)

# 3. Add copy button to materials (montaj)
# Find the materials delete button and add copy button before it
old_delete_button = """<button onClick={() => setCurrentReport({ ...currentReport, materials: currentReport.materials.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"><Icon name="Trash2" size={12} /></button>"""

new_buttons = """<div className="absolute -top-2 -right-2 flex gap-1">
                                        <button onClick={() => {
                                            const materialToCopy = {...currentReport.materials[i]};
                                            setCurrentReport({ ...currentReport, materials: [...currentReport.materials, materialToCopy] });
                                            showToast('Montaj kopyalandı', 'success');
                                        }} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors" title="Kopyala">
                                            <Icon name="Copy" size={12} />
                                        </button>
                                        <button onClick={() => setCurrentReport({ ...currentReport, materials: currentReport.materials.filter((_, idx) => idx !== i) })} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors" title="Sil">
                                            <Icon name="Trash2" size={12} />
                                        </button>
                                    </div>"""

html_content = html_content.replace(old_delete_button, new_buttons, 1)  # Only first occurrence

# 4. Add Personnel button to header
old_settings_button = """<button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                            <Icon name="Settings" />
                        </button>
                    </header>"""

new_header_buttons = """<div className="flex gap-2">
                            <button onClick={() => setView('personnel')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Personel Yönetimi">
                                <Icon name="Users" />
                            </button>
                            <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Ayarlar">
                                <Icon name="Settings" />
                            </button>
                        </div>
                    </header>"""

html_content = html_content.replace(old_settings_button, new_header_buttons)

# 5. Add Personnel Management view before Preview view
personnel_view = """
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
                                                <div>
                                                    <p className="font-black text-slate-800">{staff.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{staff.task}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1">
                                                        {staff.defaultStart} - {staff.defaultFinish}
                                                    </p>
                                                </div>
                                                <button onClick={() => handleDeleteStaff(staff.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                                    <Icon name="Trash2" size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                );
            };

"""

# Insert before Preview view
preview_marker = "const Preview = () => {"
html_content = html_content.replace(preview_marker, personnel_view + "            " + preview_marker)

# 6. Add personnel view to rendering logic
old_render = """{view === 'home' && <Home />}
                    {view === 'edit' && <Editor />}
                    {view === 'preview' && <Preview />}"""

new_render = """{view === 'home' && <Home />}
                    {view === 'edit' && <Editor />}
                    {view === 'personnel' && <PersonnelManagement />}
                    {view === 'preview' && <Preview />}"""

html_content = html_content.replace(old_render, new_render)

# 7. Add personnel selection in Editor staff section
# This is complex, will add a simpler version with "Add from saved" button

# Write the new file
with open('gazioglu-santiye-rapor-v2-full.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Yeni versiyon oluşturuldu: gazioglu-santiye-rapor-v2-full.html")
print("📋 Eklenen özellikler:")
print("  - Personel Yönetimi ekranı")
print("  - Montaj kopyalama butonu")
print("  - Ana sayfada Personel butonu")
