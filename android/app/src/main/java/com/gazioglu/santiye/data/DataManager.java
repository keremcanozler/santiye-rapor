package com.gazioglu.santiye.data;

import android.content.Context;
import com.gazioglu.santiye.model.Material;
import com.gazioglu.santiye.model.Report;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class DataManager {
    private static final String FILE_NAME = "reports.json";
    private static DataManager instance;
    private List<Report> reports;

    private DataManager() {
        reports = new ArrayList<>();
    }

    public static synchronized DataManager getInstance() {
        if (instance == null) {
            instance = new DataManager();
        }
        return instance;
    }

    public List<Report> getReports() {
        return reports;
    }

    public Report getReport(String id) {
        for (Report r : reports) {
            if (r.getId().equals(id))
                return r;
        }
        return null;
    }

    public void addReport(Report report) {
        reports.add(0, report); // Add to top
    }

    public void updateReport(Report report) {
        for (int i = 0; i < reports.size(); i++) {
            if (reports.get(i).getId().equals(report.getId())) {
                reports.set(i, report);
                return;
            }
        }
    }

    public void deleteReport(String id) {
        for (int i = 0; i < reports.size(); i++) {
            if (reports.get(i).getId().equals(id)) {
                reports.remove(i);
                return;
            }
        }
    }

    public void saveReports(Context context) {
        JSONArray jsonArray = new JSONArray();
        for (Report report : reports) {
            jsonArray.put(reportToJson(report));
        }

        try {
            FileOutputStream fos = context.openFileOutput(FILE_NAME, Context.MODE_PRIVATE);
            fos.write(jsonArray.toString().getBytes());
            fos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void loadReports(Context context) {
        reports.clear();
        try {
            File file = new File(context.getFilesDir(), FILE_NAME);
            if (!file.exists())
                return;

            FileInputStream fis = context.openFileInput(FILE_NAME);
            InputStreamReader isr = new InputStreamReader(fis);
            BufferedReader bufferedReader = new BufferedReader(isr);
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                sb.append(line);
            }
            fis.close();

            JSONArray jsonArray = new JSONArray(sb.toString());
            for (int i = 0; i < jsonArray.length(); i++) {
                reports.add(jsonToReport(jsonArray.getJSONObject(i)));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private JSONObject reportToJson(Report report) {
        JSONObject json = new JSONObject();
        try {
            json.put("id", report.getId());
            json.put("date", report.getDate());
            json.put("customer", report.getCustomer());
            json.put("project", report.getProject());
            json.put("description", report.getDescription());
            json.put("weather", report.getWeather());

            JSONArray materialsJson = new JSONArray();
            for (Material m : report.getMaterials()) {
                JSONObject mJson = new JSONObject();
                mJson.put("name", m.getName());
                mJson.put("unit", m.getUnit());
                mJson.put("quantity", m.getQuantity());
                materialsJson.put(mJson);
            }
            json.put("materials", materialsJson);

            JSONArray personnelJson = new JSONArray();
            for (com.gazioglu.santiye.model.Personnel p : report.getPersonnel()) {
                JSONObject pJson = new JSONObject();
                pJson.put("name", p.getName());
                pJson.put("role", p.getRole());
                pJson.put("hours", p.getHours());
                personnelJson.put(pJson);
            }
            json.put("personnel", personnelJson);

            JSONArray photosJson = new JSONArray();
            for (String p : report.getPhotoPaths()) {
                photosJson.put(p);
            }
            json.put("photoPaths", photosJson);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        return json;
    }

    private Report jsonToReport(JSONObject json) {
        Report report = new Report();
        try {
            report.setId(json.optString("id"));
            report.setDate(json.optString("date"));
            report.setCustomer(json.optString("customer"));
            report.setProject(json.optString("project"));
            report.setDescription(json.optString("description"));
            report.setWeather(json.optString("weather", "gunesli"));

            JSONArray materialsJson = json.optJSONArray("materials");
            if (materialsJson != null) {
                List<Material> materials = new ArrayList<>();
                for (int i = 0; i < materialsJson.length(); i++) {
                    JSONObject mJson = materialsJson.getJSONObject(i);
                    materials.add(new Material(
                            mJson.optString("name"),
                            mJson.optString("unit"),
                            mJson.optString("quantity")));
                }
                report.setMaterials(materials);
            }

            JSONArray personnelJson = json.optJSONArray("personnel");
            if (personnelJson != null) {
                List<com.gazioglu.santiye.model.Personnel> personnel = new ArrayList<>();
                for (int i = 0; i < personnelJson.length(); i++) {
                    JSONObject pJson = personnelJson.getJSONObject(i);
                    personnel.add(new com.gazioglu.santiye.model.Personnel(
                            pJson.optString("name"),
                            pJson.optString("role"),
                            pJson.optString("hours")));
                }
                report.setPersonnel(personnel);
            }

            JSONArray photosJson = json.optJSONArray("photoPaths");
            if (photosJson != null) {
                List<String> photos = new ArrayList<>();
                for (int i = 0; i < photosJson.length(); i++) {
                    photos.add(photosJson.getString(i));
                }
                report.setPhotoPaths(photos);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return report;
    }

    public void exportData(android.content.Context context, android.net.Uri uri) {
        try {
            org.json.JSONArray jsonArray = new org.json.JSONArray();
            for (Report report : reports) {
                jsonArray.put(reportToJson(report));
            }

            java.io.OutputStream os = context.getContentResolver().openOutputStream(uri);
            os.write(jsonArray.toString().getBytes());
            os.close();

            android.widget.Toast.makeText(context, "Veriler dışa aktarıldı", android.widget.Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
            android.widget.Toast.makeText(context, "Hata oluştu", android.widget.Toast.LENGTH_SHORT).show();
        }
    }

    public void importData(android.content.Context context, android.net.Uri uri) {
        try {
            java.io.InputStream is = context.getContentResolver().openInputStream(uri);
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            is.close();

            org.json.JSONArray jsonArray = new org.json.JSONArray(sb.toString());
            reports.clear();
            for (int i = 0; i < jsonArray.length(); i++) {
                reports.add(jsonToReport(jsonArray.getJSONObject(i)));
            }
            saveReports(context); // Persist immediately

        } catch (Exception e) {
            e.printStackTrace();
            android.widget.Toast.makeText(context, "İçe aktarma hatası", android.widget.Toast.LENGTH_SHORT).show();
        }
    }

    public void resetData(Context context) {
        reports.clear();
        saveReports(context);
    }
}
