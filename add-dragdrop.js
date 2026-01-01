const fs = require('fs');

// Read current file
let html = fs.readFileSync('gazioglu-santiye-rapor-v4-ENHANCED.html', 'utf8');

// Add drag-drop handlers for materials
const oldMaterialDiv = `<div key={i} className="p-5 bg-slate-50 rounded-[1.5rem] border relative space-y-3">`;

const newMaterialDiv = `<div 
                                    key={i} 
                                    draggable="true"
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('materialIndex', i);
                                        e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const fromIndex = parseInt(e.dataTransfer.getData('materialIndex'));
                                        const toIndex = i;
                                        if (fromIndex !== toIndex) {
                                            const newMaterials = [...currentReport.materials];
                                            const [moved] = newMaterials.splice(fromIndex, 1);
                                            newMaterials.splice(toIndex, 0, moved);
                                            setCurrentReport({ ...currentReport, materials: newMaterials });
                                            showToast('Montaj sırası değiştirildi', 'success');
                                        }
                                    }}
                                    className="p-5 bg-slate-50 rounded-[1.5rem] border relative space-y-3 cursor-move hover:border-blue-300 transition-all"
                                >
                                    <div className="absolute -top-2 -left-2 bg-slate-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                        {i + 1}
                                    </div>`;

html = html.replace(oldMaterialDiv, newMaterialDiv);

// Add drag-drop for photos
const oldPhotoDiv = `<div key={i} className="aspect-square relative rounded-2xl overflow-hidden border">`;

const newPhotoDiv = `<div 
                                        key={i}
                                        draggable="true"
                                        onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('photoIndex', i);
                                            e.currentTarget.style.opacity = '0.5';
                                        }}
                                        onDragEnd={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIndex = parseInt(e.dataTransfer.getData('photoIndex'));
                                            const toIndex = i;
                                            if (fromIndex !== toIndex) {
                                                const newPhotos = [...currentReport.photos];
                                                const [moved] = newPhotos.splice(fromIndex, 1);
                                                newPhotos.splice(toIndex, 0, moved);
                                                setCurrentReport({ ...currentReport, photos: newPhotos });
                                                showToast('Fotoğraf sırası değiştirildi', 'success');
                                            }
                                        }}
                                        className="aspect-square relative rounded-2xl overflow-hidden border cursor-move hover:border-blue-400 hover:scale-105 transition-all"
                                    >
                                        <div className="absolute top-1 left-1 bg-black/70 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black z-10">
                                            {i + 1}
                                        </div>`;

html = html.replace(oldPhotoDiv, newPhotoDiv);

// Write updated file
fs.writeFileSync('gazioglu-santiye-rapor-v5-DRAGDROP.html', html, 'utf8');

console.log('✅ Sürükle-bırak özelliği eklendi: gazioglu-santiye-rapor-v5-DRAGDROP.html');
console.log('\n📋 Eklenen Özellikler:');
console.log('  1. 🖱️ Montaj kartlarını sürükle-bırak ile sırala');
console.log('  2. 🖼️ Fotoğrafları sürükle-bırak ile sırala');
console.log('  3. 🔢 Otomatik numaralandırma (sol üstte)');
console.log('  4. ✨ Hover efektleri');
console.log('\n🎯 Kullanım:');
console.log('  - Montaj/fotoğraf kartını tut ve sürükle');
console.log('  - İstediğin yere bırak');
console.log('  - Sıra otomatik değişir!');
