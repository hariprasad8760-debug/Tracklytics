package com.tracklytics;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/TracklyticsApplication.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Every Spring Boot application requires a primary entry point class containing 
 *   the standard Java `main(String[] args)` method. It boots up the Spring application 
 *   context, initializes embedded Tomcat web server, and starts component scanning.
 *
 * WHAT THIS FILE DOES:
 *   1. `@SpringBootApplication`: Meta-annotation combining:
 *      - `@Configuration`: Allows defining custom Spring Beans.
 *      - `@EnableAutoConfiguration`: Enables Spring Boot's automatic setup based on classpath JARs.
 *      - `@ComponentScan`: Scans `com.tracklytics` package for Controllers, Services, Repositories.
 *   2. `@EnableJpaAuditing`: Automatically populates `@CreatedDate` and `@LastModifiedDate` fields 
 *      on database Entity models.
 *
 * FOLDER RESPONSIBILITY (com.tracklytics):
 *   Root package for the entire Spring Boot backend application.
 * ============================================================================
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TracklyticsApplication {

    /**
     * Main method executed by the Java Virtual Machine (JVM) to start Spring Boot.
     * @param args Command line arguments passed during execution.
     */
    public static void main(String[] args) {
        SpringApplication.run(TracklyticsApplication.class, args);
        System.out.println("\n========================================================================");
        System.out.println(" 🚀 TRACKLYTICS BACKEND STARTED SUCCESSFULLY ON http://localhost:8080/api/v1");
        System.out.println(" 📖 SWAGGER DOCUMENTATION AT http://localhost:8080/api/v1/swagger-ui.html");
        System.out.println("========================================================================\n");
    }
}
