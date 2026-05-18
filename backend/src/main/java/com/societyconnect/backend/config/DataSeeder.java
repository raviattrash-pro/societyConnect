package com.societyconnect.backend.config;

import com.societyconnect.backend.entity.Category;
import com.societyconnect.backend.entity.Role;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.entity.enums.RoleName;
import com.societyconnect.backend.repository.CategoryRepository;
import com.societyconnect.backend.repository.RoleRepository;
import com.societyconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, RoleName.ROLE_RESIDENT));
            roleRepository.save(new Role(null, RoleName.ROLE_PROVIDER));
            roleRepository.save(new Role(null, RoleName.ROLE_ADMIN));
        }

        if (!userRepository.existsByEmail("admin@societyconnect.com")) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            User admin = new User("admin@societyconnect.com", passwordEncoder.encode("admin123"), adminRole);
            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin@societyconnect.com / admin123");
        }

        String[][] categories = {
            {"Plumber", "🔧"}, {"Electrician", "⚡"}, {"Carpenter", "🪚"},
            {"Painter", "🎨"}, {"Maid", "🧹"}, {"AC Repair", "❄️"},
            {"Tutor", "📚"}, {"Driver", "🚗"}, {"Mechanic", "🔩"},
            {"Gardener", "🌿"}, {"Pest Control", "🐛"}, {"Locksmith", "🔑"},
            {"Grocery Shop", "🛒"}, {"Medical Shop", "💊"}, {"Other Shop", "🏪"},
            {"Laundry / Dry Cleaning", "🧺"}, {"Cook / Chef", "🍳"}, {"Babysitter / Nanny", "👶"},
            {"Pet Care", "🐕"}, {"Salon / Grooming", "✂️"}, {"Fitness / Yoga", "🧘‍♂️"},
            {"RO / Water Purifier", "💧"}, {"Appliance Repair", "📺"}, {"Car Wash", "🧽"},
            {"Packers and Movers", "📦"}
        };
        for (String[] cat : categories) {
            if (!categoryRepository.existsByName(cat[0])) {
                Category category = new Category();
                category.setName(cat[0]);
                category.setIconUrl(cat[1]);
                categoryRepository.save(category);
            }
        }
    }
}
