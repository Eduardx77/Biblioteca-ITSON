#!/bin/bash

SUPABASE_URL="https://ydwichafgvbeyxbsijms.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkd2ljaGFmZ3ZiZXl4YnNpam1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjQzMzksImV4cCI6MjA5Mzg0MDMzOX0.Kg9pqg5XIHJKNe2WzudEGHNJ6Fsx72GL3BLV79rstpQ"

echo "Intentando crear usuario admin..."

curl -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@potros.itson.edu.mx",
    "password": "Admin1234",
    "user_metadata": {
      "name": "Administrador",
      "studentId": "ADMIN001",
      "role": "admin"
    }
  }'

echo ""
echo "Done"
