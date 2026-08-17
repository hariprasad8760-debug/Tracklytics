package com.tracklytics.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/config/OpenApiConfig.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Configures Swagger OpenAPI 3 interactive documentation.
 *   Adds Bearer Token Authentication support directly to Swagger UI (`/swagger-ui.html`).
 * ============================================================================
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Tracklytics REST API",
        version = "1.0.0",
        description = "Production Spring Boot 3.x Backend APIs for Tracklytics Smart Expense & Study Analytics System",
        contact = @Contact(
            name = "Tracklytics Engineering Team",
            email = "support@tracklytics.com"
        )
    )
)
@SecurityScheme(
    name = "Bearer Authentication",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenApiConfig {
}
