$workspaces = @(
    "C:\Users\kurog\OneDrive\My AI Campany\Black Sesame HD",
    "C:\Users\kurog\OneDrive\My AI Campany\KGM Corp"
)

foreach ($p in $workspaces) {
    if (Test-Path -Path $p) {
        Write-Host "Syncing: $p"
        Set-Location -Path $p
        $s = git status --porcelain
        if ($s) {
            git add .
            $dt = Get-Date -Format "yyyy-MM-dd HH:mm"
            git commit -m "auto: $dt sync"
            git push
            Write-Host "Done."
        } else {
            Write-Host "No changes."
        }
    } else {
        Write-Warning "NotFound: $p"
    }
}
