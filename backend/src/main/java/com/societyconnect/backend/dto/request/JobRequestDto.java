package com.societyconnect.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class JobRequestDto {
    @NotNull(message = "Category is required")
    private Integer categoryId;

    @NotBlank(message = "Description is required")
    private String description;

    private BigDecimal expectedPrice;

    public JobRequestDto() {}

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getExpectedPrice() { return expectedPrice; }
    public void setExpectedPrice(BigDecimal expectedPrice) { this.expectedPrice = expectedPrice; }
}
