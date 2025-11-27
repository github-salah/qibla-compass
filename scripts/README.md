build-and-install-android.ps1

Usage

From project root on Windows PowerShell:

```powershell
# Build and install release APK on first connected device
.\scripts\build-and-install-android.ps1

# Clean then build and install
.\scripts\build-and-install-android.ps1 -Clean

# Provide alternate APK path (if you built elsewhere)
.\scripts\build-and-install-android.ps1 -ApkPath "C:\path\to\app-release.apk"
```

Notes

- Ensure `adb` is in your PATH and a device is connected with USB debugging enabled.
- The script runs `gradlew assembleRelease` and expects the APK at `android\app\build\outputs\apk\release\app-release.apk` unless `-ApkPath` is provided.
- The script also tries to copy the APK to `/sdcard/Download/` for easy manual sharing on the device.
