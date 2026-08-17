@echo off
setlocal enabledelayedexpansion
title Tracklytics Spring Boot Backend Server Launcher

echo ========================================================================
echo  🚀 TRACKLYTICS SPRING BOOT BACKEND LAUNCHER
echo  PATH: C:\Users\harip\OneDrive\Desktop\Tracklytics\run-backend.bat
echo ========================================================================
echo.

:: Explicitly navigate into C:\Users\harip\OneDrive\Desktop\Tracklytics\backend
cd /d "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend"

:: 1. CHECK FOR JAVA INSTALLATION
echo [1/3] Checking Java Development Kit (JDK)...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if defined JAVA_HOME (
        echo JAVA_HOME found at: %JAVA_HOME%
    ) else (
        echo [ERROR] Java is not recognized in system PATH or JAVA_HOME!
        echo Please install JDK 17 or JDK 21 and configure your PATH variable.
        echo.
        goto ERROR_EXIT
    )
) else (
    echo [SUCCESS] Java environment detected successfully.
)

echo.
:: 2. CHECK FOR MAVEN INSTALLATION
echo [2/3] Checking Apache Maven build tool...
set "MAVEN_CMD=mvn"

mvn -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\mvnw.cmd" (
        echo [INFO] System 'mvn' not in PATH. Using local Maven Wrapper...
        set "MAVEN_CMD=C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\mvnw.cmd"
    ) else if exist "C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.0\nbcode\java\maven\bin\mvn.cmd" (
        echo [INFO] Using detected Maven binary...
        set "MAVEN_CMD=C:\Users\harip\.vscode\extensions\oracle.oracle-java-26.0.0\nbcode\java\maven\bin\mvn.cmd"
    ) else (
        echo [ERROR] Apache Maven ('mvn') is not found in system PATH!
        echo Please install Apache Maven or configure M2_HOME/PATH environment variables.
        echo.
        goto ERROR_EXIT
    )
) else (
    echo [SUCCESS] Apache Maven detected successfully.
)

echo.
:: 3. VERIFY POM.XML
echo [3/3] Verifying Spring Boot project configuration (pom.xml)...
if not exist "C:\Users\harip\OneDrive\Desktop\Tracklytics\backend\pom.xml" (
    echo [ERROR] Cannot find 'pom.xml' in C:\Users\harip\OneDrive\Desktop\Tracklytics\backend!
    echo.
    goto ERROR_EXIT
)
echo [SUCCESS] pom.xml verified. Launching Spring Boot application on port 8080...
echo.
echo ========================================================================
echo  SERVER LOGS (Press Ctrl+C to terminate server)
echo ========================================================================
echo.

call %MAVEN_CMD% spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================================
    echo  [FAILURE] SPRING BOOT BACKEND SERVER ENCOUNTERED AN ERROR!
    echo ========================================================================
    echo Exit Code: %ERRORLEVEL%
    echo Please review the error stacktrace above.
    echo.
    goto ERROR_EXIT
)

goto END

:ERROR_EXIT
echo.
echo ------------------------------------------------------------------------
echo Process finished with errors. Terminal kept open for diagnostic review.
echo ------------------------------------------------------------------------
pause
exit /b 1

:END
echo.
echo Backend server shutdown gracefully.
pause
