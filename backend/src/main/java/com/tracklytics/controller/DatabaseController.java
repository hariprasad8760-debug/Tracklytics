package com.tracklytics.controller;

import com.tracklytics.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/database")
@Tag(name = "Database Explorer APIs", description = "Live MySQL Database diagnostics and table inspector")
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/status")
    @Operation(summary = "Get MySQL database connection status and table statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDatabaseStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        try {
            String dbName = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);

            List<String> tableNames = Arrays.asList(
                    "expenses", "study_sessions", "users", "expense_categories",
                    "study_subjects", "calendar_events", "study_goals"
            );

            List<Map<String, Object>> tableStats = new ArrayList<>();
            for (String tbl : tableNames) {
                try {
                    Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + tbl + "`", Integer.class);
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("table", tbl);
                    stat.put("rowCount", count != null ? count : 0);
                    tableStats.add(stat);
                } catch (Exception ignored) {
                    // Table might not exist yet
                }
            }

            status.put("connected", true);
            status.put("databaseName", dbName != null ? dbName : "tracklytics_db");
            status.put("version", version != null ? "MySQL " + version : "MySQL 8.0");
            status.put("host", "localhost:3306");
            status.put("tables", tableStats);
            status.put("timestamp", new Date());

            return ResponseEntity.ok(ApiResponse.success("MySQL Database is healthy and connected", status));
        } catch (Exception e) {
            status.put("connected", false);
            status.put("error", e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Unable to query MySQL database: " + e.getMessage()));
        }
    }

    @GetMapping("/preview/{tableName}")
    @Operation(summary = "Inspect raw rows from a specific MySQL table")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTableData(@PathVariable String tableName) {
        List<String> allowed = Arrays.asList(
                "expenses", "study_sessions", "users", "expense_categories",
                "study_subjects", "calendar_events", "study_goals"
        );

        if (!allowed.contains(tableName.toLowerCase())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid table name request"));
        }

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM `" + tableName + "` ORDER BY id DESC LIMIT 50");
            return ResponseEntity.ok(ApiResponse.success("Live records from MySQL table: " + tableName, rows));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error reading table " + tableName + ": " + e.getMessage()));
        }
    }
}
