package com.societyconnect.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "platform_settings")
public class Setting {
    @Id
    @Column(name = "setting_key")
    private String configKey;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String value;

    public Setting() {}
    public Setting(String configKey, String value) { this.configKey = configKey; this.value = value; }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
