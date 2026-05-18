package com.societyconnect.backend.dto.request;

public class ResidentProfileRequest {
    private String fullName;
    private String phone;
    private String societyName;
    private String address;
    private String profilePic;
    private String flatNumber;
    private String gateInstructions;
    private String preferredTimings;
    private String societyCode;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSocietyName() { return societyName; }
    public void setSocietyName(String societyName) { this.societyName = societyName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    public String getGateInstructions() { return gateInstructions; }
    public void setGateInstructions(String gateInstructions) { this.gateInstructions = gateInstructions; }
    public String getPreferredTimings() { return preferredTimings; }
    public void setPreferredTimings(String preferredTimings) { this.preferredTimings = preferredTimings; }
    public String getSocietyCode() { return societyCode; }
    public void setSocietyCode(String societyCode) { this.societyCode = societyCode; }
}
