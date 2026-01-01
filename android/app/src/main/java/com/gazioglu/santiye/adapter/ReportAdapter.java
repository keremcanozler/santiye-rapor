package com.gazioglu.santiye.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.gazioglu.santiye.R;
import com.gazioglu.santiye.model.Report;

import java.util.List;

public class ReportAdapter extends RecyclerView.Adapter<ReportAdapter.ReportViewHolder> {

    private List<Report> reportList;
    private final OnItemClickListener listener;
    private final OnDeleteClickListener deleteListener;

    public interface OnItemClickListener {
        void onItemClick(Report report);
    }

    public interface OnDeleteClickListener {
        void onDeleteClick(Report report);
    }

    public ReportAdapter(List<Report> reportList, OnItemClickListener listener, OnDeleteClickListener deleteListener) {
        this.reportList = reportList;
        this.listener = listener;
        this.deleteListener = deleteListener;
    }

    public void setReports(List<Report> reports) {
        this.reportList = reports;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ReportViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_report_card, parent, false);
        return new ReportViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ReportViewHolder holder, int position) {
        Report report = reportList.get(position);
        holder.bind(report, listener, deleteListener);
    }

    @Override
    public int getItemCount() {
        return reportList.size();
    }

    static class ReportViewHolder extends RecyclerView.ViewHolder {
        TextView cardDate, cardCustomer, cardProject, cardDesc;
        ImageButton btnDelete;

        public ReportViewHolder(@NonNull View itemView) {
            super(itemView);
            cardDate = itemView.findViewById(R.id.cardDate);
            cardCustomer = itemView.findViewById(R.id.cardCustomer);
            cardProject = itemView.findViewById(R.id.cardProject);
            cardDesc = itemView.findViewById(R.id.cardDesc);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(final Report report, final OnItemClickListener listener,
                final OnDeleteClickListener deleteListener) {
            cardDate.setText(report.getDate() != null ? report.getDate() : "Tarihsiz");
            cardCustomer.setText(report.getCustomer() != null && !report.getCustomer().isEmpty() ? report.getCustomer()
                    : "MÜŞTERİ BELİRTİLMEMİŞ");
            cardProject.setText(
                    report.getProject() != null && !report.getProject().isEmpty() ? report.getProject() : "Proje Yok");
            cardDesc.setText(
                    report.getDescription() != null && !report.getDescription().isEmpty() ? report.getDescription()
                            : "Açıklama yok...");

            itemView.setOnClickListener(v -> listener.onItemClick(report));
            btnDelete.setOnClickListener(v -> deleteListener.onDeleteClick(report));
        }
    }
}
