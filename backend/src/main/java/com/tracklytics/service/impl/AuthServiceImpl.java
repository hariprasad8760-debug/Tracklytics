package com.tracklytics.service.impl;

import com.tracklytics.entity.ExpenseCategory;
import com.tracklytics.entity.Role;
import com.tracklytics.entity.User;
import com.tracklytics.entity.UserSettings;
import com.tracklytics.exception.BadRequestException;

import com.tracklytics.repository.ExpenseCategoryRepository;
import com.tracklytics.repository.UserRepository;
import com.tracklytics.repository.UserSettingsRepository;
import com.tracklytics.request.LoginRequest;
import com.tracklytics.request.RegisterRequest;
import com.tracklytics.response.JwtResponse;
import com.tracklytics.security.JwtTokenProvider;
import com.tracklytics.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Service implementation handling User Registration and Login.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // Constructor Injection (Never Field Injection!)
    public AuthServiceImpl(UserRepository userRepository,
                           ExpenseCategoryRepository categoryRepository,
                           UserSettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public JwtResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address is already in use!");
        }

        // 1. Create and save new User
        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Create default Expense Categories for the new user
        createDefaultCategories(savedUser);

        // 3. Create default User Settings
        UserSettings defaultSettings = UserSettings.builder()
                .user(savedUser)
                .currency("USD")
                .themeMode("DARK")
                .dailyStudyTargetHours(4.0)
                .monthlyExpenseBudget(5000.0)
                .build();
        settingsRepository.save(defaultSettings);

        // 4. Generate JWT Token
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail());

        return JwtResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid user credentials"));

        return JwtResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private void createDefaultCategories(User user) {
        List<ExpenseCategory> defaultCategories = Arrays.asList(
                ExpenseCategory.builder().name("Software Subscriptions").colorCode("#8b5cf6").iconName("code").user(user).build(),
                ExpenseCategory.builder().name("Education / Books").colorCode("#3b82f6").iconName("book").user(user).build(),
                ExpenseCategory.builder().name("Dining & Coffee").colorCode("#amber").iconName("coffee").user(user).build(),
                ExpenseCategory.builder().name("Stipend / Income").colorCode("#10b981").iconName("dollar").user(user).build()
        );
        categoryRepository.saveAll(defaultCategories);
    }
}
