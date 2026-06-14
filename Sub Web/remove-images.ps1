# Script to remove image properties from product data files

$files = @(
    "server\seedProductsComplete.js",
    "vite-project\src\lib\mockData.js",
    "vite-project\src\pages\HomePage.improved.jsx"
)

$results = @{}

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        # Read all lines
        $lines = Get-Content $fullPath
        $totalLines = $lines.Count
        
        # Filter out lines containing image URLs
        $filteredLines = $lines | Where-Object { $_ -notmatch "image:\s*'https://images\.unsplash\.com" }
        $newLineCount = $filteredLines.Count
        
        # Calculate removed count
        $removedCount = $totalLines - $newLineCount
        
        # Write back to file
        $filteredLines | Set-Content $fullPath -Encoding UTF8
        
        # Store result
        $results[$file] = $removedCount
        
        Write-Host "Processed $file : Removed $removedCount image properties"
    } else {
        Write-Host "File not found: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`nSummary:"
Write-Host "========================================" 
foreach ($key in $results.Keys) {
    Write-Host "$($key): $($results[$key]) image properties removed"
}
