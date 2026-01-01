package com.gazioglu.santiye;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.gazioglu.santiye.data.DataManager; // Assumed Import/Export logic will be moved or accessed via HomeActivity logic or moved to DataManager
// Actually, HomeActivity logic for import/export was using `this` activity context.
// For simplicity, I'll copy the logic OR just keep Import/Export in Home header for now as Moving it requires refactoring DataManager to handle Activity Results independent of HomeActivity
// Strategy: I will keep Import/Export buttons in HomeActivity for now as moving them is risky for "ActivityResult" dependencies unless I duplicate code.
// Wait, the user asked to move them.
// I can implement logic here.

import java.io.InputStream;
import java.io.FileOutputStream;
import java.io.File;

public class SettingsActivity extends AppCompatActivity {

    private ImageView imgLogoPreview;
    private Button btnUploadLogo, btnExportData, btnImportData;

    // Logo Picker
    private final ActivityResultLauncher<Intent> logoPickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    saveLogo(imageUri);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        imgLogoPreview = findViewById(R.id.imgLogoPreview);
        btnUploadLogo = findViewById(R.id.btnUploadLogo);
        btnExportData = findViewById(R.id.btnExportData);
        btnImportData = findViewById(R.id.btnImportData);

        loadLogo();

        btnUploadLogo.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK,
                    android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            logoPickerLauncher.launch(intent);
        });

        // Helper method call for Import/Export not needed if using DataManager directly
        // or if logic kept here
        // But since we moved it to DataManager, we call DataManager.

        setupImportExport();

        findViewById(R.id.btnResetData).setOnClickListener(v -> {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setTitle("Verileri Sıfırla")
                    .setMessage("TÜM raporlar silinecek. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?")
                    .setPositiveButton("Evet, SİL", (dialog, which) -> {
                        com.gazioglu.santiye.data.DataManager.getInstance().resetData(this);
                        Toast.makeText(this, "Tüm veriler silindi", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("İptal", null)
                    .show();
        });
    }

    // --- Logo Logic ---
    private void loadLogo() {
        File file = new File(getFilesDir(), "company_logo.png");
        if (file.exists()) {
            imgLogoPreview.setImageURI(Uri.fromFile(file));
        }
    }

    private void saveLogo(Uri uri) {
        try {
            InputStream is = getContentResolver().openInputStream(uri);
            File file = new File(getFilesDir(), "company_logo.png");
            FileOutputStream fos = new FileOutputStream(file);
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
            }
            fos.close();
            is.close();

            loadLogo();
            Toast.makeText(this, "Logo kaydedildi", Toast.LENGTH_SHORT).show();

        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Logo hatası", Toast.LENGTH_SHORT).show();
        }
    }

    // --- Import/Export Logic (Duplicated from Home for standalone capability) ---
    private ActivityResultLauncher<Intent> exportLauncher;
    private ActivityResultLauncher<Intent> importLauncher;

    private void setupImportExport() {
        exportLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        DataManager.getInstance().exportData(this, uri);
                    }
                });

        importLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        DataManager.getInstance().importData(this, uri);
                        Toast.makeText(this, "Veriler yüklendi. Uygulamayı yeniden başlatın.", Toast.LENGTH_LONG)
                                .show();
                    }
                });

        btnExportData.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, "santiye_yedek.json");
            exportLauncher.launch(intent);
        });

        btnImportData.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/json");
            importLauncher.launch(intent);
        });
    }
}
