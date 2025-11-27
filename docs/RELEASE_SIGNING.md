# Android Signing via GitHub Actions (Optional)

For initial public releases, you can upload the unsigned `app-release.aab` and use Play Console to sign (Google Play App Signing). If you prefer local signing, do not commit keystores; use GitHub Secrets.

## Secrets
- `ANDROID_KEYSTORE_BASE64`: Base64 of your `.jks` or `.keystore`
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password (can be same as keystore)

## Workflow Snippet (Add to release-android.yml)
```yaml
      - name: Decode keystore
        if: secrets.ANDROID_KEYSTORE_BASE64
        run: |
          echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > android/app/release.keystore
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}

      - name: Configure signing
        run: |
          cat << EOF >> android/app/build.gradle
          android.signingConfigs {
            release {
              storeFile file('release.keystore')
              storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
              keyAlias System.getenv('ANDROID_KEY_ALIAS')
              keyPassword System.getenv('ANDROID_KEY_PASSWORD')
            }
          }
          android.buildTypes.release.signingConfig = android.signingConfigs.release
          EOF

        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
```

## Notes
- Prefer Play App Signing to avoid managing private keys in CI.
- Never commit keystores or passwords to the repository.
