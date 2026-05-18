package com.societyconnect.backend.dto.response;

public class MetricDto {
    private String name;
    private Long value;

    public MetricDto(String name, Long value) {
        this.name = name;
        this.value = value;
    }

    public String getName() { return name; }
    public Long getValue() { return value; }
}
