package com.tracklytics.controller;

import com.tracklytics.dto.StudySessionDto;
import com.tracklytics.entity.StudySession;
import com.tracklytics.entity.StudySubject;
import com.tracklytics.entity.User;
import com.tracklytics.repository.StudySessionRepository;
import com.tracklytics.repository.StudySubjectRepository;
import com.tracklytics.repository.UserRepository;
import com.tracklytics.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/study-sessions")
@Tag(name = "Study Session APIs", description = "Endpoints for managing MySQL Study Sessions")
@Transactional
public class StudySessionController {

    private final StudySessionRepository studySessionRepository;
    private final StudySubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public StudySessionController(StudySessionRepository studySessionRepository,
                                  StudySubjectRepository subjectRepository,
                                  UserRepository userRepository) {
        this.studySessionRepository = studySessionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get all study sessions from MySQL database")
    public ResponseEntity<ApiResponse<List<StudySessionDto>>> getAllStudySessions() {
        List<StudySession> sessions = studySessionRepository.findAll();
        List<StudySessionDto> dtos = sessions.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Study sessions retrieved successfully from MySQL", dtos));
    }

    @PostMapping
    @Operation(summary = "Save new study session directly into MySQL database")
    public ResponseEntity<ApiResponse<StudySessionDto>> addStudySession(@RequestBody Map<String, Object> payload) {
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User newUser = User.builder()
                    .fullName("Hari Prasath")
                    .email("hari@tracklytics.com")
                    .password("$2a$10$e8wYV9xJvN0x6bH1g0H8/.kZ5n3fQ2W8mXy1bZ5aK0L2mN3oP4q5r")
                    .role(com.tracklytics.entity.Role.ROLE_USER)
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        String subjectName = (String) payload.getOrDefault("subject", payload.getOrDefault("subjectName", "General Study"));
        StudySubject subject = subjectRepository.findByUserId(user.getId()).stream()
                .filter(s -> s.getName().equalsIgnoreCase(subjectName))
                .findFirst()
                .orElseGet(() -> {
                    StudySubject sub = StudySubject.builder()
                            .name(subjectName)
                            .user(user)
                            .colorCode("#8b5cf6")
                            .targetHoursPerWeek(10.0)
                            .build();
                    return subjectRepository.save(sub);
                });

        int durationMinutes = 60;
        if (payload.containsKey("durationMinutes") && payload.get("durationMinutes") != null) {
            try {
                durationMinutes = Integer.parseInt(payload.get("durationMinutes").toString());
            } catch (Exception ignored) {}
        } else if (payload.containsKey("hours") && payload.get("hours") != null) {
            try {
                double h = Double.parseDouble(payload.get("hours").toString().replace("hrs", "").trim());
                durationMinutes = (int) Math.round(h * 60);
            } catch (Exception ignored) {}
        }

        int focusScore = 90;
        if (payload.containsKey("focusScore") && payload.get("focusScore") != null) {
            try {
                focusScore = Integer.parseInt(payload.get("focusScore").toString());
            } catch (Exception ignored) {}
        }

        LocalDateTime sessionDate = LocalDateTime.now();
        if (payload.containsKey("date") && payload.get("date") != null) {
            try {
                sessionDate = LocalDate.parse(payload.get("date").toString()).atStartOfDay();
            } catch (Exception ignored) {}
        }

        String notes = (String) payload.getOrDefault("notes", "Logged study session");

        StudySession session = StudySession.builder()
                .durationMinutes(durationMinutes)
                .focusScore(focusScore)
                .notes(notes)
                .sessionDate(sessionDate)
                .subject(subject)
                .user(user)
                .build();

        StudySession saved = studySessionRepository.save(session);
        return ResponseEntity.ok(ApiResponse.success("Study session saved to MySQL", toDto(saved)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete study session by ID from MySQL database")
    public ResponseEntity<ApiResponse<String>> deleteStudySession(@PathVariable Long id) {
        if (studySessionRepository.existsById(id)) {
            studySessionRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Study session deleted successfully from MySQL", "DELETED"));
        }
        return ResponseEntity.ok(ApiResponse.success("Study session not found or already deleted", "NOT_FOUND"));
    }

    private StudySessionDto toDto(StudySession s) {
        StudySessionDto dto = new StudySessionDto();
        dto.setId(s.getId());
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.setFocusScore(s.getFocusScore());
        dto.setNotes(s.getNotes());
        dto.setSessionDate(s.getSessionDate());
        dto.setCreatedAt(s.getCreatedAt());
        if (s.getSubject() != null) {
            dto.setSubjectId(s.getSubject().getId());
            dto.setSubjectName(s.getSubject().getName());
            dto.setSubjectColor(s.getSubject().getColorCode());
        } else {
            dto.setSubjectName("General Study");
            dto.setSubjectColor("#8b5cf6");
        }
        return dto;
    }
}
