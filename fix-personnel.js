const fs = require('fs');

// Read the v2 FULL file
let html = fs.readFileSync('gazioglu-santiye-rapor-v2-FULL.html', 'utf8');

// 1. Remove time fields from Personnel Management - update the form
const oldPersonnelForm = `<FormInput 
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
                                </div>`;

const newPersonnelForm = `<FormInput 
                                    placeholder="Görev *" 
                                    value={newStaff.task} 
                                    onChange={e => setNewStaff({...newStaff, task: e.target.value})} 
                                />`;

html = html.replace(oldPersonnelForm, newPersonnelForm);

// 2. Update newStaff state initialization
html = html.replace(
    `const [newStaff, setNewStaff] = useState({ name: '', task: '', defaultStart: '08:00', defaultFinish: '17:00' });`,
    `const [newStaff, setNewStaff] = useState({ name: '', task: '' });`
);

// 3. Update reset after adding staff
html = html.replace(
    `setNewStaff({ name: '', task: '', defaultStart: '08:00', defaultFinish: '17:00' });`,
    `setNewStaff({ name: '', task: '' });`
);

// 4. Remove time display from saved personnel list
const oldStaffDisplay = `<p className="text-xs text-slate-500 mt-1">{staff.task}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1">
                                                        {staff.defaultStart} - {staff.defaultFinish}
                                                    </p>`;

const newStaffDisplay = `<p className="text-xs text-slate-500 mt-1">{staff.task}</p>`;

html = html.replace(oldStaffDisplay, newStaffDisplay);

// 5. Update handleAddFromSaved to not use time fields
html = html.replace(
    `const handleAddFromSaved = (staff) => {
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
                };`,
    `const handleAddFromSaved = (staff) => {
                    // Check if already added
                    const alreadyAdded = currentReport.staff.some(s => s.name === staff.name && s.task === staff.task);
                    if (alreadyAdded) {
                        showToast(\`\${staff.name} zaten raporda\`, 'warning');
                        return;
                    }
                    setCurrentReport({
                        ...currentReport,
                        staff: [...currentReport.staff, {
                            name: staff.name,
                            task: staff.task,
                            startTime: '08:00',
                            finishTime: '17:00',
                            location: ''
                        }]
                    });
                    showToast(\`\${staff.name} rapora eklendi\`, 'success');
                };`
);

// 6. Add personnel selection to Editor - find the staff section and add dropdown
const oldStaffSection = `<section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-blue-600"><Icon name="Users" size={18} /> <span className="font-black text-xs uppercase">Personel</span></div>
                                <button onClick={() => setCurrentReport({ ...currentReport, staff: [...currentReport.staff, { name: '', task: '', startTime: '08:00', finishTime: '17:00', location: '' }] })} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Icon name="Plus" /></button>
                            </div>`;

const newStaffSection = `<section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-blue-600"><Icon name="Users" size={18} /> <span className="font-black text-xs uppercase">Personel</span></div>
                                <button onClick={() => setView('personnel')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Kayıtlı Personel Ekle"><Icon name="Plus" /></button>
                            </div>
                            {savedStaff.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-2xl space-y-2">
                                    <p className="text-xs font-black text-blue-900 uppercase">Kayıtlı Personel ({savedStaff.length})</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {savedStaff.map(staff => {
                                            const isAdded = currentReport.staff.some(s => s.name === staff.name && s.task === staff.task);
                                            return (
                                                <button
                                                    key={staff.id}
                                                    onClick={() => {
                                                        if (isAdded) {
                                                            showToast(\`\${staff.name} zaten raporda\`, 'warning');
                                                            return;
                                                        }
                                                        setCurrentReport({
                                                            ...currentReport,
                                                            staff: [...currentReport.staff, {
                                                                name: staff.name,
                                                                task: staff.task,
                                                                startTime: '08:00',
                                                                finishTime: '17:00',
                                                                location: ''
                                                            }]
                                                        });
                                                        showToast(\`\${staff.name} eklendi\`, 'success');
                                                    }}
                                                    disabled={isAdded}
                                                    className={\`p-3 rounded-xl text-left transition-colors \${isAdded ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800 hover:bg-blue-100 border border-blue-200'}\`}
                                                >
                                                    <p className="font-bold text-sm">{staff.name}</p>
                                                    <p className="text-xs text-slate-500">{staff.task}</p>
                                                    {isAdded && <p className="text-[10px] text-green-600 font-bold mt-1">✓ Eklendi</p>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}`;

html = html.replace(oldStaffSection, newStaffSection);

// Write updated file
fs.writeFileSync('gazioglu-santiye-rapor-v3-FIXED.html', html, 'utf8');

console.log('✅ Personel sistemi düzeltildi: gazioglu-santiye-rapor-v3-FIXED.html');
console.log('\n📋 Değişiklikler:');
console.log('  1. ✅ Giriş/çıkış saati kaldırıldı');
console.log('  2. ✅ Raporda kayıtlı personel listesi görünüyor');
console.log('  3. ✅ Aynı personel tekrar eklenemiyor');
console.log('  4. ✅ Eklenen personeller griye dönüyor');
