package com.tracklytics.service;

import com.tracklytics.request.LoginRequest;
import com.tracklytics.request.RegisterRequest;
import com.tracklytics.response.JwtResponse;

/**
 * Service interface for Authentication and User Registration operations.
 */
public interface AuthService {
    JwtResponse register(RegisterRequest registerRequest);
    JwtResponse login(LoginRequest loginRequest);
}
