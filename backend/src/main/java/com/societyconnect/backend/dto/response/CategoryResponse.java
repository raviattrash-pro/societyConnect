package com.societyconnect.backend.dto.response;

public class CategoryResponse {
    private Integer id;
    private String name;
    private String iconUrl;

    public CategoryResponse() {}
    public CategoryResponse(Integer id, String name, String iconUrl) {
        this.id = id; this.name = name; this.iconUrl = iconUrl;
    }
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getIconUrl() { return iconUrl; }
}

