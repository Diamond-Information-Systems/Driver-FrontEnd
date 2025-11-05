# Icon Generation Script for Vaye Driver App
# This script helps set up the proper app icons and favicon

# 1. Copy VayeLogoB.png to replace current favicon and logos
# You can do this manually or use this PowerShell script

Write-Host "Setting up Vaye Driver App Icons..." -ForegroundColor Green

# Define paths
$sourceImage = "public/images/VayeLogoB.png"
$publicDir = "public"

# Check if source image exists
if (Test-Path $sourceImage) {
    Write-Host "Found Vaye logo at: $sourceImage" -ForegroundColor Green
    
    # Copy the logo as different sizes (you'll need to manually resize these)
    Write-Host "Copying logo files..." -ForegroundColor Yellow
    
    # Copy to logo192.png and logo512.png (these should be resized to 192x192 and 512x512)
    Copy-Item $sourceImage "$publicDir/logo192.png" -Force
    Copy-Item $sourceImage "$publicDir/logo512.png" -Force
    
    Write-Host "✓ Copied logo files" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You need to manually resize these images:" -ForegroundColor Red
    Write-Host "  - logo192.png should be 192x192 pixels" -ForegroundColor Yellow
    Write-Host "  - logo512.png should be 512x512 pixels" -ForegroundColor Yellow
    Write-Host "  - Create a favicon.ico file (16x16, 32x32, 64x64 sizes)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can use online tools like:" -ForegroundColor Cyan
    Write-Host "  - https://favicon.io/ (for favicon generation)" -ForegroundColor Cyan
    Write-Host "  - https://resizeimage.net/ (for image resizing)" -ForegroundColor Cyan
    
} else {
    Write-Host "Error: VayeLogoB.png not found at $sourceImage" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Resize the logo files to proper dimensions" -ForegroundColor White
Write-Host "2. Generate a favicon.ico file from the logo" -ForegroundColor White
Write-Host "3. Update manifest.json and index.html (this will be done automatically)" -ForegroundColor White