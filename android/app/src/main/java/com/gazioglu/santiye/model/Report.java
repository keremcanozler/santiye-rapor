package com.gazioglu.santiye.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Report {
    private String id;
    private String date;
    private String customer;
    private String project;
    private String description;
    private String weather;
    private List<Material> materials;
    private List<Personnel> personnel;
    private List<String> photoPaths;

    public Report() {
        this.id = UUID.randomUUID().toString();
        this.materials = new ArrayList<>();
        this.personnel = new ArrayList<>();
        this.photoPaths = new ArrayList<>();
        this.weather = "gunesli"; // Default
        this.date = "";
        this.customer = "";
        this.project = "";
        this.description = "";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWeather() {
        return weather;
    }

    public void setWeather(String weather) {
        this.weather = weather;
    }

    public List<Material> getMaterials() {
        return materials;
    }

    public void setMaterials(List<Material> materials) {
        this.materials = materials;
    }

    public void addMaterial(Material material) {
        this.materials.add(material);
    }

    public List<Personnel> getPersonnel() {
        return personnel;
    }

    public void setPersonnel(List<Personnel> personnel) {
        this.personnel = personnel;
    }

    public void addPersonnel(Personnel p) {
        this.personnel.add(p);
    }

    public List<String> getPhotoPaths() {
        return photoPaths;
    }

    public void setPhotoPaths(List<String> photoPaths) {
        this.photoPaths = photoPaths;
    }

    public void addPhotoPath(String path) {
        this.photoPaths.add(path);
    }
}
