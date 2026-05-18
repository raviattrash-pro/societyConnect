package com.societyconnect.backend.dto.request;

import java.math.BigDecimal;

public class ServiceRequest {
    private String serviceName;
    private String description;
    private BigDecimal price;

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
