package com.tracklytics.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/config/AppConfig.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Spring uses `@Configuration` classes to declare `@Bean` definitions that are 
 *   instantiated and managed in the Spring Application Context. ModelMapper needs 
 *   to be registered as a Spring Bean so it can be injected into Services.
 *
 * WHAT THIS FILE DOES:
 *   1. `@Configuration`: Marks this class as a source of Spring bean definitions.
 *   2. `@Bean modelMapper()`: Instantiates ModelMapper for Entity <-> DTO conversions.
 * ============================================================================
 */
@Configuration
public class AppConfig {

    /**
     * Registers ModelMapper bean in Spring container for Constructor Injection.
     * @return ModelMapper instance configured with standard matching strategy.
     */
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);
        return modelMapper;
    }
}
