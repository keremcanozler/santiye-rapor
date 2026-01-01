package com.gazioglu.santiye;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.gazioglu.santiye.adapter.ReportAdapter;
import com.gazioglu.santiye.data.DataManager;
import com.gazioglu.santiye.model.Report;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class HomeActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ReportAdapter adapter;
    private DataManager dataManager;
    private TextView emptyView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        dataManager = DataManager.getInstance();
        dataManager.loadReports(this);

        recyclerView = findViewById(R.id.recyclerView);
        emptyView = findViewById(R.id.emptyView);
        FloatingActionButton fabAdd = findViewById(R.id.fabAdd);

        findViewById(R.id.btnSettings).setOnClickListener(v -> {
            startActivity(new Intent(this, SettingsActivity.class));
        });

        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        adapter = new ReportAdapter(dataManager.getReports(),
                report -> {
                    // Edit Click
                    Intent intent = new Intent(HomeActivity.this, EditActivity.class);
                    intent.putExtra("reportId", report.getId());
                    startActivity(intent);
                },
                report -> {
                    // Delete Click
                    new AlertDialog.Builder(this)
                            .setTitle("Raporu Sil?")
                            .setMessage("Bu rapor kalıcı olarak silinecek.")
                            .setPositiveButton("Sil", (dialog, which) -> {
                                dataManager.deleteReport(report.getId());
                                dataManager.saveReports(this);
                                updateUI();
                                Toast.makeText(this, "Rapor silindi", Toast.LENGTH_SHORT).show();
                            })
                            .setNegativeButton("İptal", null)
                            .show();
                });

        recyclerView.setAdapter(adapter);

        fabAdd.setOnClickListener(v -> {
            // New Report
            Report newReport = new Report();
            // Default Date
            newReport.setDate(new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                    .format(new java.util.Date()));
            dataManager.addReport(newReport);
            dataManager.saveReports(this);

            Intent intent = new Intent(HomeActivity.this, EditActivity.class);
            intent.putExtra("reportId", newReport.getId());
            startActivity(intent);
        });

        updateUI();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Reload data in case it changed in EditActivity
        dataManager.loadReports(this);
        updateUI();
    }

    private void updateUI() {
        adapter.setReports(dataManager.getReports());
        adapter.notifyDataSetChanged();

        if (dataManager.getReports().isEmpty()) {
            emptyView.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            emptyView.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

}
