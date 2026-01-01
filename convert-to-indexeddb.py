#!/usr/bin/env python3
"""
Gazioğlu Şantiye Rapor - localStorage'dan IndexedDB'ye Dönüştürücü
Bu script, mevcut HTML dosyasındaki tüm localStorage kullanımlarını
IndexedDB ile değiştirir.
"""

import re
import sys

def convert_to_indexeddb(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # IndexedDB Storage Manager'ı ekle
    storage_manager = '''
        // ========================================
        // IndexedDB Storage Manager
        // Sınırsız depolama için localStorage yerine IndexedDB kullanır
        // ========================================
        class StorageManager {
            constructor() {
                this.dbName = 'GaziogluReportsDB';
                this.dbVersion = 1;
                this.db = null;
            }

            async init() {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open(this.dbName, this.dbVersion);

                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        this.db = request.result;
                        resolve();
                    };

                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        
                        if (!db.objectStoreNames.contains('reports')) {
                            db.createObjectStore('reports', { keyPath: 'id' });
                        }
                        
                        if (!db.objectStoreNames.contains('photos')) {
                            const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                            photoStore.createIndex('reportId', 'reportId', { unique: false });
                        }
                        
                        if (!db.objectStoreNames.contains('settings')) {
                            db.createObjectStore('settings', { keyPath: 'key' });
                        }
                        
                        if (!db.objectStoreNames.contains('staff')) {
                            db.createObjectStore('staff', { keyPath: 'id' });
                        }
                    };
                });
            }

            async saveReport(report) {
                const tx = this.db.transaction(['reports', 'photos'], 'readwrite');
                const reportStore = tx.objectStore('reports');
                const photoStore = tx.objectStore('photos');
                
                const reportData = { ...report };
                const photos = reportData.photos || [];
                delete reportData.photos;
                
                reportStore.put(reportData);
                
                const photoIndex = photoStore.index('reportId');
                const oldPhotosRequest = photoIndex.getAll(report.id);
                
                oldPhotosRequest.onsuccess = () => {
                    const oldPhotos = oldPhotosRequest.result;
                    for (const photo of oldPhotos) {
                        photoStore.delete(photo.id);
                    }
                    
                    for (let i = 0; i < photos.length; i++) {
                        photoStore.add({
                            reportId: report.id,
                            data: photos[i],
                            order: i
                        });
                    }
                };
                
                return new Promise((resolve, reject) => {
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                });
            }

            async getAllReports() {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['reports', 'photos'], 'readonly');
                    const reportStore = tx.objectStore('reports');
                    const photoStore = tx.objectStore('photos');
                    
                    const reportsRequest = reportStore.getAll();
                    
                    reportsRequest.onsuccess = async () => {
                        const reports = reportsRequest.result;
                        
                        const photoPromises = reports.map(report => {
                            return new Promise((resolvePhotos) => {
                                const photoIndex = photoStore.index('reportId');
                                const photosRequest = photoIndex.getAll(report.id);
                                
                                photosRequest.onsuccess = () => {
                                    const photos = photosRequest.result;
                                    report.photos = photos.sort((a, b) => a.order - b.order).map(p => p.data);
                                    resolvePhotos();
                                };
                            });
                        });
                        
                        await Promise.all(photoPromises);
                        resolve(reports);
                    };
                    
                    reportsRequest.onerror = () => reject(reportsRequest.error);
                });
            }

            async deleteReport(reportId) {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['reports', 'photos'], 'readwrite');
                    const reportStore = tx.objectStore('reports');
                    const photoStore = tx.objectStore('photos');
                    
                    reportStore.delete(reportId);
                    
                    const photoIndex = photoStore.index('reportId');
                    const photosRequest = photoIndex.getAll(reportId);
                    
                    photosRequest.onsuccess = () => {
                        const photos = photosRequest.result;
                        for (const photo of photos) {
                            photoStore.delete(photo.id);
                        }
                    };
                    
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                });
            }

            async saveSetting(key, value) {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['settings'], 'readwrite');
                    const store = tx.objectStore('settings');
                    store.put({ key, value });
                    
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                });
            }

            async getSetting(key) {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['settings'], 'readonly');
                    const store = tx.objectStore('settings');
                    const request = store.get(key);
                    
                    request.onsuccess = () => resolve(request.result?.value);
                    request.onerror = () => reject(request.error);
                });
            }

            async saveStaff(staffList) {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['staff'], 'readwrite');
                    const store = tx.objectStore('staff');
                    
                    const clearRequest = store.clear();
                    
                    clearRequest.onsuccess = () => {
                        for (const person of staffList) {
                            store.put(person);
                        }
                    };
                    
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                });
            }

            async getStaff() {
                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(['staff'], 'readonly');
                    const store = tx.objectStore('staff');
                    const request = store.getAll();
                    
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            }
        }

        const storage = new StorageManager();
'''
    
    # Storage Manager'ı script başına ekle
    content = content.replace(
        'const { useState, useEffect, useRef } = React;',
        'const { useState, useEffect, useRef } = React;\n' + storage_manager
    )
    
    # Başlığı güncelle
    content = content.replace(
        '<title>Gazioğlu Endüstriyel - Şantiye Rapor Sistemi</title>',
        '<title>Gazioğlu Endüstriyel - Şantiye Rapor Sistemi v6 (IndexedDB)</title>'
    )
    
    # localStorage.getItem çağrılarını değiştir
    content = re.sub(
        r"localStorage\.getItem\('gazioglu_reports'\)",
        "await storage.getAllReports()",
        content
    )
    
    # localStorage.setItem çağrılarını değiştir
    content = re.sub(
        r"localStorage\.setItem\('gazioglu_reports',\s*JSON\.stringify\(([^)]+)\)\)",
        r"await storage.saveReport(\1)",
        content
    )
    
    # Logo için
    content = re.sub(
        r"localStorage\.getItem\('gazioglu_corporate_logo'\)",
        "await storage.getSetting('corporate_logo')",
        content
    )
    
    content = re.sub(
        r"localStorage\.setItem\('gazioglu_corporate_logo',\s*([^)]+)\)",
        r"await storage.saveSetting('corporate_logo', \1)",
        content
    )
    
    # Staff için
    content = re.sub(
        r"localStorage\.getItem\('gazioglu_saved_staff'\)",
        "await storage.getStaff()",
        content
    )
    
    content = re.sub(
        r"localStorage\.setItem\('gazioglu_saved_staff',\s*JSON\.stringify\(([^)]+)\)\)",
        r"await storage.saveStaff(\1)",
        content
    )
    
    # localStorage.removeItem
    content = re.sub(
        r"localStorage\.removeItem\('gazioglu_corporate_logo'\)",
        "await storage.saveSetting('corporate_logo', null)",
        content
    )
    
    # useEffect'i async yap
    content = content.replace(
        'useEffect(() => {',
        'useEffect(() => { (async () => {'
    )
    
    content = content.replace(
        '}, []);',
        '})(); }, []);'
    )
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Dönüştürme tamamlandı: {output_file}")
    print(f"📊 Dosya boyutu: {len(content)} byte")

if __name__ == '__main__':
    input_file = 'gazioglu-santiye-rapor-v5-DRAGDROP.html'
    output_file = 'gazioglu-santiye-rapor-v6-INDEXEDDB.html'
    
    try:
        convert_to_indexeddb(input_file, output_file)
    except Exception as e:
        print(f"❌ Hata: {e}")
        sys.exit(1)
