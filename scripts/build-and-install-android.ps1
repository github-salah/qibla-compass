<#
PowerShell script: build-and-install-android.ps1
- Runs a release build (assembleRelease)
- Installs the produced release APK on a connected Android device via adb

Usage:
  .\scripts\build-and-install-android.ps1 [-Clean] [-ApkPath <path>] [-GradleArgs <args>]

Examples:
  .\scripts\build-and-install-android.ps1
  .\scripts\build-and-install-android.ps1 -Clean
  .\scripts\build-and-install-android.ps1 -ApkPath "C:\custom\app-release.apk"
#>
param(
    [switch]$Clean,
    [string]$ApkPath = "android\app\build\outputs\apk\release\app-release.apk",
    [string]$GradleArgs = ''
)

function Write-Log($msg){ Write-Host "[build-and-install] $msg" }

# Ensure running from repo root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path (Resolve-Path "$scriptDir\..")

if ($Clean) {
    Write-Log "Cleaning android build artifacts..."
    Push-Location android
    .\gradlew clean
    if ($LASTEXITCODE -ne 0) { throw "Gradle clean failed" }
    Pop-Location
}

Write-Log "Starting release build (assembleRelease)..."
Push-Location android
$gradleCmd = ".\gradlew assembleRelease $GradleArgs"
Write-Log "Running: $gradleCmd"
Invoke-Expression $gradleCmd
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Gradle assembleRelease failed" }
Pop-Location

if (-not (Test-Path $ApkPath)) {
    throw "APK not found at $ApkPath. Build may have failed or the path is incorrect."
}

# Check for connected devices
$devices = (adb devices) -split "\r?\n" | Select-String -Pattern "\tdevice$" | ForEach-Object { ($_ -split "\t")[0] }
if (-not $devices) {
    throw "No connected Android devices found. Ensure USB debugging is enabled and device is connected."
}

$device = $devices[0]
Write-Log "Using device: $device"

# Install APK
Write-Log "Installing APK to device..."
adb install -r $ApkPath
if ($LASTEXITCODE -ne 0) { throw "adb install failed" }

Write-Log "Installation successful."
Write-Log "Done."

# Attempt to launch the app on the device
try {
    # Try to read applicationId from android/app/build.gradle
    $buildGradlePath = "android\app\build.gradle"
    $packageName = 'org.khairlabs.qibla'
    if (Test-Path $buildGradlePath) {
        $buildGradleText = Get-Content -Path $buildGradlePath -Raw
        $m = [regex]::Match($buildGradleText, "applicationId\s+'([^']+)'")
        if ($m.Success) { $packageName = $m.Groups[1].Value }
    }

    Write-Log "Attempting to launch package: $packageName"

    # Primary launch using am start
    adb shell am start -n "$packageName/.MainActivity"
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Primary launch failed; trying monkey fallback..."
        adb shell monkey -p $packageName -c android.intent.category.LAUNCHER 1
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Warning: automatic launch failed. You can open the app manually on the device."
        } else {
            Write-Log "App launched (monkey fallback)."
        }
    } else {
        Write-Log "App launched."
    }
} catch {
    Write-Log "Warning: failed to launch the app automatically - $_"
}