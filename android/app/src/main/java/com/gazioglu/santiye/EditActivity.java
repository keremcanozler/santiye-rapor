package com.gazioglu.santiye;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.gazioglu.santiye.data.DataManager;
import com.gazioglu.santiye.model.Report;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;
import java.io.InputStream;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

public class EditActivity extends AppCompatActivity {

    private EditText inputDate, inputCustomer, inputProject, inputDescription;
    private RadioGroup radioGroupWeather;
    private WebView bgWebView;
    private Button btnGeneratePDF, btnAddMaterial, btnAddPersonnel, btnAddPhoto;
    private android.widget.LinearLayout materialsContainer, personnelContainer, photosContainer;

    // Photo Picker
    private final ActivityResultLauncher<Intent> photoPickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    saveAndAddPhoto(imageUri);
                }
            });

    private Report currentReport;
    private String reportId;
    private boolean isModified = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // We reuse the layout

        // Get ID
        if (getIntent().hasExtra("reportId")) {
            reportId = getIntent().getStringExtra("reportId");
            currentReport = DataManager.getInstance().getReport(reportId);
        }

        if (currentReport == null) {
            Toast.makeText(this, "Rapor bulunamadı!", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        // Bind Views
        inputDate = findViewById(R.id.inputDate);
        inputCustomer = findViewById(R.id.inputCustomer);
        inputProject = findViewById(R.id.inputProject);
        inputDescription = findViewById(R.id.inputDescription);

        // Set Defaults if new
        if (currentReport.getCustomer().isEmpty()) {
            currentReport.setCustomer("BORUSAN");
        }
        if (currentReport.getProject().isEmpty()) {
            currentReport.setProject("BORUSAN BORU DEPREM GÜÇLENDİRME PROJESİ");
        }
        radioGroupWeather = findViewById(R.id.radioGroupWeather);
        bgWebView = findViewById(R.id.bgWebView);
        btnGeneratePDF = findViewById(R.id.btnGeneratePDF);
        btnAddMaterial = findViewById(R.id.btnAddMaterial);
        materialsContainer = findViewById(R.id.materialsContainer);
        btnAddPersonnel = findViewById(R.id.btnAddPersonnel);
        personnelContainer = findViewById(R.id.personnelContainer);
        btnAddPhoto = findViewById(R.id.btnAddPhoto);
        photosContainer = findViewById(R.id.photosContainer);

        // Initialize WebView (Hidden Engine)
        setupWebView();

        // Initialize Date Picker
        setupDatePicker();

        // Restore Data form Object
        restoreData();

        // Restore Materials & Personnel & Photos
        restoreMaterials();
        restorePersonnel();
        restorePhotos();

        // Auto-Save Listeners
        setupAutoSave();

        // Generate PDF Action
        btnGeneratePDF.setOnClickListener(v -> generatePDF());

        // Add Material Action
        btnAddMaterial.setOnClickListener(v -> {
            addMaterialRow(new com.gazioglu.santiye.model.Material("", "", ""));
            isModified = true;
        });

        // Add Personnel Action
        btnAddPersonnel.setOnClickListener(v -> {
            addPersonnelRow(new com.gazioglu.santiye.model.Personnel("", "", ""));
            isModified = true;
        });

        // Add Photo Action
        btnAddPhoto.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK,
                    android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            photoPickerLauncher.launch(intent);
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        scrapeMaterials();
        scrapePersonnel(); // Scrape before save
        if (isModified) {
            DataManager.getInstance().saveReports(this);
            isModified = false;
        }
    }

    private void setupWebView() {
        WebSettings settings = bgWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        bgWebView.addJavascriptInterface(new WebAppInterface(), "Android");
        bgWebView.loadUrl("file:///android_asset/public/index.html");
    }

    private void setupDatePicker() {
        Calendar calendar = Calendar.getInstance();
        inputDate.setOnClickListener(v -> {
            new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
                String date = String.format(Locale.getDefault(), "%d-%02d-%02d", year, month + 1, dayOfMonth);
                inputDate.setText(date);
                currentReport.setDate(date);
                isModified = true;
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
        });
    }

    private void setupAutoSave() {
        TextWatcher watcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                if (inputCustomer.getText().hashCode() == s.hashCode()) { // This condition is likely incorrect and will
                                                                          // prevent customer data from being saved.
                    currentReport.setCustomer(s.toString());
                    isModified = true;
                }
                if (inputProject.getText().hashCode() == s.hashCode()) {
                    currentReport.setProject(s.toString());
                    isModified = true;
                }
                if (inputDescription.getText().hashCode() == s.hashCode()) {
                    currentReport.setDescription(s.toString());
                    isModified = true;
                }
            }
        };

        inputCustomer.addTextChangedListener(watcher);
        inputProject.addTextChangedListener(watcher);
        inputDescription.addTextChangedListener(watcher);

        // Weather Auto-Save
        radioGroupWeather.setOnCheckedChangeListener((group, checkedId) -> {
            String weatherCode = "gunesli";
            if (checkedId == R.id.weatherSunny)
                weatherCode = "gunesli";
            else if (checkedId == R.id.weatherCloudy)
                weatherCode = "bulutlu";
            else if (checkedId == R.id.weatherRainy)
                weatherCode = "yagmurlu";
            else if (checkedId == R.id.weatherSnowy)
                weatherCode = "karli";

            currentReport.setWeather(weatherCode);
            isModified = true;
        });
    }

    private void restoreData() {
        inputDate.setText(currentReport.getDate());
        inputCustomer.setText(currentReport.getCustomer());
        inputProject.setText(currentReport.getProject());
        inputDescription.setText(currentReport.getDescription());

        String savedWeather = currentReport.getWeather();
        if (savedWeather.equals("gunesli"))
            radioGroupWeather.check(R.id.weatherSunny);
        else if (savedWeather.equals("bulutlu"))
            radioGroupWeather.check(R.id.weatherCloudy);
        else if (savedWeather.equals("yagmurlu"))
            radioGroupWeather.check(R.id.weatherRainy);
        else if (savedWeather.equals("karli"))
            radioGroupWeather.check(R.id.weatherSnowy);
    }

    private void restoreMaterials() {
        materialsContainer.removeAllViews();
        if (currentReport.getMaterials() != null) {
            for (com.gazioglu.santiye.model.Material m : currentReport.getMaterials()) {
                addMaterialRow(m);
            }
        }
    }

    private void addMaterialRow(com.gazioglu.santiye.model.Material material) {
        android.view.View view = getLayoutInflater().inflate(R.layout.item_material_row, materialsContainer, false);

        EditText name = view.findViewById(R.id.inputMatName);
        EditText unit = view.findViewById(R.id.inputMatUnit);
        EditText qty = view.findViewById(R.id.inputMatQty);
        android.widget.ImageButton delete = view.findViewById(R.id.btnDeleteMat);

        name.setText(material.getName());
        unit.setText(material.getUnit());
        qty.setText(material.getQuantity());

        // Listeners to mark modified
        android.text.TextWatcher watcher = new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                isModified = true;
            }
        };
        name.addTextChangedListener(watcher);
        unit.addTextChangedListener(watcher);
        qty.addTextChangedListener(watcher);

        delete.setOnClickListener(v -> {
            materialsContainer.removeView(view);
            isModified = true;
        });

        materialsContainer.addView(view);
    }

    private void restorePersonnel() {
        personnelContainer.removeAllViews();
        if (currentReport.getPersonnel() != null) {
            for (com.gazioglu.santiye.model.Personnel p : currentReport.getPersonnel()) {
                addPersonnelRow(p);
            }
        }
    }

    private void addPersonnelRow(com.gazioglu.santiye.model.Personnel personnel) {
        android.view.View view = getLayoutInflater().inflate(R.layout.item_personnel_row, personnelContainer, false);

        EditText name = view.findViewById(R.id.inputPersName);
        EditText role = view.findViewById(R.id.inputPersRole);
        EditText hours = view.findViewById(R.id.inputPersHours);
        android.widget.ImageButton delete = view.findViewById(R.id.btnDeletePers);

        name.setText(personnel.getName());
        role.setText(personnel.getRole());
        hours.setText(personnel.getHours());

        android.text.TextWatcher watcher = new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                isModified = true;
            }
        };
        name.addTextChangedListener(watcher);
        role.addTextChangedListener(watcher);
        hours.addTextChangedListener(watcher);

        delete.setOnClickListener(v -> {
            personnelContainer.removeView(view);
            isModified = true;
        });

        personnelContainer.addView(view);
        personnelContainer.addView(view);
    }

    private void restorePhotos() {
        photosContainer.removeAllViews();
        if (currentReport.getPhotoPaths() != null) {
            for (String path : currentReport.getPhotoPaths()) {
                addPhotoView(path);
            }
        }
    }

    private void saveAndAddPhoto(Uri uri) {
        try {
            // Copy to internal storage
            String filename = "photo_" + System.currentTimeMillis() + ".jpg";
            java.io.File file = new java.io.File(getFilesDir(), filename);

            InputStream is = getContentResolver().openInputStream(uri);
            java.io.FileOutputStream fos = new java.io.FileOutputStream(file);
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
            }
            fos.close();
            is.close();

            String path = file.getAbsolutePath();
            currentReport.getPhotoPaths().add(path);
            addPhotoView(path);
            isModified = true;

        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Fotoğraf hatası", Toast.LENGTH_SHORT).show();
        }
    }

    private void addPhotoView(String path) {
        android.view.View view = getLayoutInflater().inflate(R.layout.item_photo, photosContainer, false);
        android.widget.ImageView img = view.findViewById(R.id.imgPhoto);
        android.widget.ImageButton delete = view.findViewById(R.id.btnDeletePhoto);

        android.graphics.Bitmap bitmap = android.graphics.BitmapFactory.decodeFile(path);
        img.setImageBitmap(bitmap);

        delete.setOnClickListener(v -> {
            photosContainer.removeView(view);
            currentReport.getPhotoPaths().remove(path);
            isModified = true;
        });

        photosContainer.addView(view);
    }

    private void scrapeMaterials() {
        java.util.List<com.gazioglu.santiye.model.Material> newMaterials = new java.util.ArrayList<>();
        for (int i = 0; i < materialsContainer.getChildCount(); i++) {
            android.view.View view = materialsContainer.getChildAt(i);
            EditText name = view.findViewById(R.id.inputMatName);
            EditText unit = view.findViewById(R.id.inputMatUnit);
            EditText qty = view.findViewById(R.id.inputMatQty);

            if (name.getText().toString().trim().isEmpty() &&
                    unit.getText().toString().trim().isEmpty() &&
                    qty.getText().toString().trim().isEmpty()) {
                continue; // Skip empty rows
            }

            newMaterials.add(new com.gazioglu.santiye.model.Material(
                    name.getText().toString(),
                    unit.getText().toString(),
                    qty.getText().toString()));
        }
        currentReport.setMaterials(newMaterials);
    }

    private void scrapePersonnel() {
        java.util.List<com.gazioglu.santiye.model.Personnel> newPersonnel = new java.util.ArrayList<>();
        for (int i = 0; i < personnelContainer.getChildCount(); i++) {
            android.view.View view = personnelContainer.getChildAt(i);
            EditText name = view.findViewById(R.id.inputPersName);
            EditText role = view.findViewById(R.id.inputPersRole);
            EditText hours = view.findViewById(R.id.inputPersHours);

            if (name.getText().toString().trim().isEmpty() &&
                    role.getText().toString().trim().isEmpty()) {
                continue;
            }

            newPersonnel.add(new com.gazioglu.santiye.model.Personnel(
                    name.getText().toString(),
                    role.getText().toString(),
                    hours.getText().toString()));
        }
        currentReport.setPersonnel(newPersonnel);
    }

    private void generatePDF() {
        // Save first
        scrapeMaterials();
        scrapePersonnel();
        DataManager.getInstance().saveReports(this);

        try {
            JSONObject reportCmd = new JSONObject();
            reportCmd.put("id", currentReport.getId());
            reportCmd.put("date", currentReport.getDate());
            reportCmd.put("customer", currentReport.getCustomer());
            reportCmd.put("project", currentReport.getProject());
            reportCmd.put("description", currentReport.getDescription());
            reportCmd.put("weather", currentReport.getWeather());

            // Serialize Arrays
            org.json.JSONArray pArr = new org.json.JSONArray();
            for (com.gazioglu.santiye.model.Personnel p : currentReport.getPersonnel()) {
                org.json.JSONObject obj = new org.json.JSONObject();
                obj.put("name", p.getName());
                obj.put("role", p.getRole());
                obj.put("hours", p.getHours());
                pArr.put(obj);
            }
            reportCmd.put("personnel", pArr);

            org.json.JSONArray mArr = new org.json.JSONArray();
            for (com.gazioglu.santiye.model.Material m : currentReport.getMaterials()) {
                org.json.JSONObject obj = new org.json.JSONObject();
                obj.put("name", m.getName());
                obj.put("unit", m.getUnit());
                obj.put("quantity", m.getQuantity());
                mArr.put(obj);
            }
            reportCmd.put("materials", mArr);

            // Serialize Photos (Base64 for WebView)
            org.json.JSONArray photoArr = new org.json.JSONArray();
            for (String path : currentReport.getPhotoPaths()) {
                try {
                    android.graphics.Bitmap bm = android.graphics.BitmapFactory.decodeFile(path);
                    java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                    bm.compress(android.graphics.Bitmap.CompressFormat.JPEG, 70, baos);
                    byte[] b = baos.toByteArray();
                    String encoded = android.util.Base64.encodeToString(b, android.util.Base64.NO_WRAP);
                    photoArr.put(encoded);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            reportCmd.put("logoBase64", getLogoBase64()); // Placeholder
            reportCmd.put("photos", photoArr);

            // Trigger JS function
            String jsCode = "window.generatePDFFromNative(" + reportCmd.toString() + ")";
            bgWebView.evaluateJavascript(jsCode, null);

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private String getLogoBase64() {
        try {
            java.io.File file = new java.io.File(getFilesDir(), "company_logo.png");
            if (!file.exists())
                return "";

            java.io.FileInputStream fis = new java.io.FileInputStream(file);
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) > -1) {
                baos.write(buffer, 0, len);
            }
            fis.close();

            return android.util.Base64.encodeToString(baos.toByteArray(), android.util.Base64.NO_WRAP);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void onPDFCreated(String base64) {
            // Handle PDF
        }
    }
}
