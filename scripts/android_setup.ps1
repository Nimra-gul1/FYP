# Temporary Android Environment Setup for current PowerShell session
$ANDROID_SDK_PATH = "$env:LOCALAPPDATA\Android\Sdk"

if (Test-Path $ANDROID_SDK_PATH) {
    $env:ANDROID_HOME = $ANDROID_SDK_PATH
    $env:ANDROID_SDK_ROOT = $ANDROID_SDK_PATH
    
    $PLATFORM_TOOLS = Join-Path $ANDROID_SDK_PATH "platform-tools"
    $EMULATOR_PATH = Join-Path $ANDROID_SDK_PATH "emulator"
    
    if (-not ($env:PATH -like "*$PLATFORM_TOOLS*")) {
        $env:PATH = "$PLATFORM_TOOLS;$env:PATH"
    }
    if (-not ($env:PATH -like "*$EMULATOR_PATH*")) {
        $env:PATH = "$EMULATOR_PATH;$env:PATH"
    }

    Write-Host "✅ Android Environment Variables set for this session." -ForegroundColor Green
    Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
    Write-Host "Next steps:"
    Write-Host "1. Start Emulator: emulator -avd Medium_Phone_API_36.1"
    Write-Host "2. Run App: npx expo run:android"
} else {
    Write-Error "Could not find Android SDK at $ANDROID_SDK_PATH"
}
