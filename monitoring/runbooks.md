# Instant Grow — Incident Response Runbooks

## Stripe Webhook Failure

**Symptoms:** Orders not created after successful payment, admin no notification

**Steps:**
1. Check Supabase Edge Function logs: `functions/stripe-webhook`
2. Verify Stripe webhook delivery in Stripe Dashboard → Webhooks
3. Check `stripe_session_id` — if webhook already processed, idempotency skips it
4. If signature verification fails: check `STRIPE_WEBHOOK_SECRET` matches
5. If DB write fails: check `SUPABASE_SERVICE_ROLE_KEY` and schema
6. Manual fix: Create order/payment/company records via SQL

## Site Down

**Symptoms:** Users cannot access instantgrow.net
**Possible causes:** DNS issue, hosting provider outage, deployment error

**Steps:**
1. Check hosting provider status page
2. Check DNS resolution: `nslookup instantgrow.net`
3. Check if recent deployment caused the issue (rollback if needed)
4. Redeploy previous stable version
5. Verify SSL certificate is valid
6. Check `_redirects` and `_headers` files

## Database Issues

**Symptoms:** Data not loading, query timeouts, RLS errors

**Steps:**
1. Check Supabase dashboard for database health
2. Check database connection limits
3. Review slow queries in Supabase → Database → Query Performance
4. Add missing indexes if needed
5. Check RLS policies are correctly applied
6. Verify migration status

## Email Notifications Failing

**Symptoms:** Users not receiving emails

**Steps:**
1. Check `VITE_EMAIL_ENDPOINT` is configured
2. Check Resend dashboard for API status
3. Verify `RESEND_API_KEY` is valid
4. Check email sending function logs
5. Check spam folder / DMARC configuration

## File Upload Issues

**Symptoms:** Users cannot upload documents

**Steps:**
1. Check file size (< 10 MB)
2. Check file type (PDF, PNG, JPEG, WEBP, DOC, DOCX)
3. If using R2: check R2 Worker logs
4. If using Supabase Storage: check Storage bucket exists and policies
5. Check browser console for CORS errors
