$SUPABASE_URL = "https://ydwichafgvbeyxbsijms.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkd2ljaGFmZ3ZiZXl4YnNpam1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjQzMzksImV4cCI6MjA5Mzg0MDMzOX0.Kg9pqg5XIHJKNe2WzudEGHNJ6Fsx72GL3BLV79rstpQ"

Write-Host "Intentando crear usuario admin..."

$body = @{
    email = "admin@potros.itson.edu.mx"
    password = "Admin1234"
    user_metadata = @{
        name = "Administrador"
        studentId = "ADMIN001"
        role = "admin"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$SUPABASE_URL/auth/v1/signup" `
    -Method POST `
    -Headers @{
        "apikey" = $ANON_KEY
        "Content-Type" = "application/json"
    } `
    -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    $user = $response.Content | ConvertFrom-Json
    Write-Host "✅ Usuario creado: $($user.user.id)"
    Write-Host "Email: $($user.user.email)"
} else {
    Write-Host "Error: $($response.StatusCode)"
    Write-Host $response.Content
}
