# Low-Level Design (LLD) - SocietyConnect

## 1. Database Schema & Relationships (ER Diagram)

The application uses an Entity-Relationship model stored in **TiDB Cloud**. Key relations are structured as follows:

```mermaid
erDiagram
    USERS ||--|| RESIDENT_PROFILES : "has profile"
    USERS ||--|| PROVIDER_PROFILES : "has profile"
    USERS ||--o{ MESSAGES : "sends/receives"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    CATEGORIES ||--o{ PROVIDER_PROFILES : "groups"
    CATEGORIES ||--o{ SERVICES : "defines"
    
    PROVIDER_PROFILES ||--o{ SERVICES : "offers"
    PROVIDER_PROFILES ||--o{ BOOKINGS : "receives"
    PROVIDER_PROFILES ||--o{ REVIEWS : "gets reviewed"
    PROVIDER_PROFILES ||--o{ FAVORITES : "favorited by"
    
    RESIDENT_PROFILES ||--o{ BOOKINGS : "creates"
    RESIDENT_PROFILES ||--o{ FAVORITES : "favorites"
    RESIDENT_PROFILES ||--o{ RESIDENT_SKILLS : "has skill"
    
    BOOKINGS ||--|| REVIEWS : "generates"
    BOOKINGS ||--o{ JOB_REQUESTS : "leads to"

    USERS {
        Long id PK
        String email UK
        String password
        Boolean enabled
        String role "ROLE_RESIDENT, ROLE_PROVIDER, ROLE_ADMIN"
    }

    RESIDENT_PROFILES {
        Long id PK
        Long user_id FK
        String full_name
        String address
        String flat_number
        String contact_number
    }

    PROVIDER_PROFILES {
        Long id PK
        Long user_id FK
        Long category_id FK
        String full_name
        String phone
        String bio
        Double base_price
        Integer experience_years
        String availability "AVAILABLE, BUSY, OFFLINE"
        Boolean is_verified "RWA Approved"
        Boolean id_verified
        Boolean police_verified
        Boolean rwa_approved
        String kyc_status
        Boolean emergency_enabled
        Boolean protection_eligible
        String premium_tier "STANDARD, PRO, ELITE"
        Integer response_time_minutes
        Integer reliability_score
        String service_packages
        String portfolio_urls
        String available_slots
        String eco_practices
        Boolean is_green
        Double latitude
        Double longitude
    }

    BOOKINGS {
        Long id PK
        Long resident_id FK
        Long provider_id FK
        Long category_id FK
        String description
        String status "PENDING, ACCEPTED, EN_ROUTE, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED"
        String payment_status "PENDING, PAID, DISPUTED, REFUNDED"
        String scheduled_at
        String created_at
        String eta_minutes
        String dispute_reason
        String dispute_resolution
        String screenshot_url "Verification Upload"
        String transaction_id
    }

    REVIEWS {
        Long id PK
        Long booking_id FK
        Long resident_id FK
        Integer rating "1-5 Stars"
        String comment
        DateTime created_at
    }

    MESSAGES {
        Long id PK
        Long sender_id FK
        Long receiver_id FK
        String content
        DateTime created_at
        Boolean is_read
    }

    GRIEVANCES {
        Long id PK
        String email
        String description
        String status "PENDING, RESOLVED"
        DateTime created_at
    }
```

---

## 2. Platform Core Algorithms

### The Trust Score Algorithm (`calculateTrustScore`)
The ranking of service providers in search results is dictated by a dynamic **Trust Score (0-100)**. This prevents bad actors and boosts high-quality providers.

The code in `ProviderController.java` computes the score using the following logic:

$$\text{Trust Score} = \text{Base (35)} + \text{Bonuses} \quad [\text{Capped at 100}]$$

#### Point Distribution Breakdown:
1.  **RWA Verification (`isVerified`)**: **+15 points**
2.  **Identity Verified (`idVerified`)**: **+10 points**
3.  **Police Check Approved (`policeVerified`)**: **+10 points**
4.  **Customer Ratings**: **+ (Average Rating $\times$ 5)** (Max: **+25 points**)
5.  **Customer Engagement**: **+ (Review Count $\times$ 2)** (Max: **+15 points**)
6.  **Completed Jobs Count**: **+ (Job Count $\times$ 1)** (Max: **+10 points**)
7.  **Rapid Dispatch Response**: **+5 points** (If response time is $\le 30$ mins)
8.  **Elite Premium Tier**: **+5 points** (If subscribing to the `ELITE` subscription)

---

## 3. Detailed REST API Documentation

All controllers are mapped under the `/api` route prefix. JWT token must be supplied as an `Authorization: Bearer <TOKEN>` header.

### Authentication Endpoints (`/api/auth`)
*   `POST /register`: Registers a new User (Resident or Provider).
*   `POST /login`: Authenticates user and returns JWT Token & profile metadata.
*   `POST /forgot-password`: Generates reset token and triggers mail notification.
*   `POST /reset-password`: Consumes reset token and commits new password.
*   `POST /grievance`: Public endpoint allowing user complaints or password seed requests directly to system Admins.

### Booking & Transaction Endpoints (`/api/bookings`)
*   `POST /`: Creates a booking lead (Requires `ROLE_RESIDENT`).
*   `GET /my`: Retrieves authenticated user's bookings list.
*   `PATCH /{id}/status`: Updates status (Pending $\rightarrow$ Accepted $\rightarrow$ En Route $\rightarrow$ In Progress $\rightarrow$ Completed / Cancelled). (Requires `ROLE_PROVIDER` or `ROLE_ADMIN`).
*   `PATCH /{id}/payment`: Uploads dispute screenshots & marks payment completed. (Requires `ROLE_RESIDENT`).
*   `PATCH /{id}/eta`: Updates provider arrival times. (Requires `ROLE_PROVIDER`).
*   `PATCH /{id}/dispute`: Flag booking as disputed. (Requires `ROLE_RESIDENT`).
*   `PATCH /{id}/dispute/resolve`: Admin resolution overrides and payouts. (Requires `ROLE_ADMIN`).
*   `GET /revenue-summary`: Comprehensive platform tax and commission statistics. (Requires `ROLE_ADMIN`).

### User Profiles Endpoints (`/api/profiles`)
*   `GET /me`: Returns profile metadata based on authenticated role.
*   `PUT /resident`: Update Flat, Address, Contact details. (Requires `ROLE_RESIDENT`).
*   `PUT /provider`: Update Bio, Experience, Base rates, Location data, and availability. (Requires `ROLE_PROVIDER`).

### Provider Operations (`/api/providers`)
*   `GET /{id}`: Details provider profile including ratings, reviews lists, packages, and trust scores.
*   `PATCH /location`: Accepts lat/long updates from provider client GPS.
*   `PATCH /business-settings`: Update dispatch variables (`responseTimeMinutes`, `isGreen`, `availableSlots`, subscription packages).

### System Administration (`/api/admin`)
*   `GET /dashboard`: Aggregated platform statistics.
*   `GET /users`: Active user list directory.
*   `PATCH /users/{id}/toggle`: Toggle lock state on user accounts.
*   `GET /providers/unverified`: Lists providers pending background audits.
*   `PATCH /providers/{id}/verify`: Approve RWA background screening checks.
*   `PATCH /settings/{key}`: Adjust system settings keys (e.g. system commission rate, registration windows).

---

## 4. Frontend Component & Routing Map

The frontend React application uses **React Router (v6)**. 

### Page Mappings:
1.  `/login` & `/register`: Clean card interfaces using local validation states.
2.  `/`: HomePage router redirecting users to matching role panels.
3.  `/search`: Fluid filters listing verified providers by search query, filters (verification, green badge, premium tier), and sorted by Trust Score.
4.  `/provider/{id}`: Public provider profile detailing reviews timeline, available bookings calendar, and services.
5.  `/messages`: SSE/WebSocket real-time chat dashboard showing active resident-provider chats.
6.  `/growth-hub`: Platform business summary detailing verification moats, active group deals, and emergency contact list.
7.  `/aether-planner`: Desktop productivity tool displaying Pomodoro timer, tasks timeline, and wellness tracking panels.
8.  **Dashboards**:
    *   `/resident-dashboard`: Track active jobs, dispute filings, payment receipts, and bookmark collections.
    *   `/provider-dashboard`: Subscription panels, bookings dispatcher, map updates, and package designer.
    *   `/admin-dashboard`: Dispute audits list, verification toggle queues, settings managers, and revenue dials.
