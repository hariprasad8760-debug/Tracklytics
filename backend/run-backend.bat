@echo off
title Tracklytics Spring Boot Backend Server

echo ========================================================================
echo  SPRING BOOT BACKEND LAUNCHER
echo  PATH: C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\run-backend.bat
echo ========================================================================
echo.

cd /d "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend"

echo [1/3] Checking Java environment...
java -version
if errorlevel 1 goto JAVA_ERROR
echo [SUCCESS] Java detected successfully.
echo.

echo [2/3] Checking Apache Maven build tool...
set MAVEN_CMD=

where mvn >nul 2>&1
if not errorlevel 1 (
    set MAVEN_CMD=mvn
    echo [SUCCESS] System Maven detected.
    goto MAVEN_FOUND
)

if exist "C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.1\nbcode\java\maven\bin\mvn.cmd" (
    set MAVEN_CMD=C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.1\nbcode\java\maven\bin\mvn.cmd
    echo [INFO] Using VS Code Oracle extension Maven...
    goto MAVEN_FOUND
)

if exist "C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.0\nbcode\java\maven\bin\mvn.cmd" (
    set MAVEN_CMD=C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.0\nbcode\java\maven\bin\mvn.cmd
    echo [INFO] Using VS Code Oracle extension Maven (26.0.0)...
    goto MAVEN_FOUND
)

if exist "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\mvnw.cmd" (
    set MAVEN_CMD=C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\mvnw.cmd
    echo [INFO] Using Maven Wrapper...
    goto MAVEN_FOUND
)

goto MAVEN_ERROR

:MAVEN_FOUND
echo [SUCCESS] Maven tool ready: %MAVEN_CMD%
echo.

echo [3/3] Verifying pom.xml...
if not exist "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\pom.xml" goto POM_ERROR
echo [SUCCESS] pom.xml verified.
echo.

echo ========================================================================
echo  STARTING SPRING BOOT BACKEND ON PORT 8080...
echo  API: http://localhost:8080/api/v1
echo  Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
echo ========================================================================
echo.

call "%MAVEN_CMD%" spring-boot:run

if errorlevel 1 goto RUN_ERROR
goto END

:JAVA_ERROR
echo [ERROR] Java is not installed or not in PATH!
pause
exit /b 1

:MAVEN_ERROR
echo [ERROR] Maven is not installed or not found anywhere!
pause
exit /b 1

:POM_ERROR
echo [ERROR] pom.xml not found in backend directory!
pause
exit /b 1

:RUN_ERROR
echo.
echo [ERROR] Spring Boot server encountered a runtime error.
pause
exit /b 1

:END
echo Backend server stopped gracefully.
pause
