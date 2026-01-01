package com.gazioglu.santiye.model;

public class Personnel {
    private String name;
    private String role;
    private String hours;

    public Personnel(String name, String role, String hours) {
        this.name = name;
        this.role = role;
        this.hours = hours;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getHours() {
        return hours;
    }

    public void setHours(String hours) {
        this.hours = hours;
    }
}
