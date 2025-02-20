# Deploy all Stripe-related Edge Functions
Write-Host "Deploying Stripe-related Edge Functions..."

# Deploy stripe-webhook function
Write-Host "`nDeploying stripe-webhook function..."
supabase functions deploy stripe-webhook --project-ref sxekxuboywmrzhzgpaei

# Deploy create-checkout-session function
Write-Host "`nDeploying create-checkout-session function..."
supabase functions deploy create-checkout-session --project-ref sxekxuboywmrzhzgpaei

# Deploy create-portal-session function
Write-Host "`nDeploying create-portal-session function..."
supabase functions deploy create-portal-session --project-ref sxekxuboywmrzhzgpaei

Write-Host "`nAll functions deployed successfully!"

# Reminder for environment variables
Write-Host "`nRemember to set these environment variables in the Supabase dashboard:"
Write-Host "- STRIPE_SECRET_KEY"
Write-Host "- STRIPE_WEBHOOK_SECRET"
Write-Host "- SUPABASE_URL"
Write-Host "- SUPABASE_ANON_KEY"
Write-Host "- SUPABASE_SERVICE_ROLE_KEY"

Write-Host "`nYou can set them using the Supabase CLI:"
Write-Host "supabase secrets set STRIPE_SECRET_KEY=your-secret-key"
Write-Host "supabase secrets set STRIPE_WEBHOOK_SECRET=your-webhook-secret"
Write-Host "etc..."
