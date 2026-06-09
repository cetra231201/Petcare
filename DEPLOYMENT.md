# Deployment Guide - PetCare Clinic

## Pre-Deployment Checklist

### Local Setup Verification
- [ ] Clone the repository and install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env` and fill in all required values
- [ ] Run type checking: `npm run type-check`
- [ ] Run ESLint: `npm run lint:fix`
- [ ] Run tests (if available): `npm test`
- [ ] Build the application: `npm run build`
- [ ] Verify build output in `.next/` directory

### Database Setup
- [ ] PostgreSQL database created and running
- [ ] Database URL set in `DATABASE_URL` environment variable
- [ ] Run migrations: `npm run db:migrate:dev` (dev) or `npm run db:migrate` (production)
- [ ] Seed database if needed: `npm run db:seed`
- [ ] Test database connection: `curl http://localhost:3000/api/health`

### Environment Variables Required
Before deploying, ensure these variables are set:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/petcare` |
| `NEXTAUTH_SECRET` | Secret key for JWT signing (minimum 32 chars) | `$(openssl rand -base64 32)` |
| `NEXTAUTH_URL` | URL where the app is deployed | `https://petcare.example.com` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP authentication user | `noreply@petcare.example.com` |
| `SMTP_PASSWORD` | SMTP authentication password | `your-app-password` |
| `SMTP_FROM` | Sender email address | `PetCare Clinic <noreply@petcare.example.com>` |
| `NODE_ENV` | Environment mode | `production` |

### Security Checklist
- [ ] Ensure `NEXTAUTH_SECRET` is securely generated: `openssl rand -base64 32`
- [ ] Never commit `.env` file to version control
- [ ] Verify CORS headers are appropriately configured
- [ ] Confirm SSL/TLS certificate is valid for domain
- [ ] Review security headers in `next.config.mjs`
- [ ] Check database user has least privilege access
- [ ] Enable database backups

## Docker Deployment

### Building Docker Image
```bash
# Build the Docker image
docker build -t petcare:latest .

# Test image locally
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/petcare" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e SMTP_HOST="smtp.example.com" \
  petcare:latest
```

### Docker Compose (Development)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Clean everything including volumes
docker-compose down -v
```

### Production Docker Deployment
```bash
# Build optimized image
docker build --build-arg NODE_ENV=production -t petcare:1.0.0 .

# Push to registry
docker push petcare:1.0.0

# Deploy with docker-compose or Kubernetes
# Ensure environment variables are set in deployment configuration
```

## Post-Deployment Verification

### Health Check
Test the health endpoint to verify the application is running:
```bash
curl -X GET https://your-domain.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-06-09T10:30:00.000Z",
#   "version": "0.1.0",
#   "database": "connected",
#   "uptime": 125.34
# }
```

### Login Test
1. Navigate to `https://your-domain.com/login`
2. Use test credentials to verify authentication works
3. Verify session management and token generation
4. Test role-based redirects:
   - Admin: `/dashboard/admin`
   - Doctor: `/dashboard/dokter`
   - Staff: `/dashboard/staff`
   - Client: `/dashboard/pelanggan`

### Real-Time Features (SSE) Test
1. Open two browser tabs to the application
2. Create an appointment in one tab
3. Verify real-time update in the other tab
4. Check browser network tab for SSE connection on `/api/appointment/sse`
5. Verify connection timeout after 30 minutes

### Email Functionality Test
1. Create a test appointment
2. Verify confirmation email is sent
3. Check email contains correct appointment details
4. Test password reset email flow

### Database Connectivity
```bash
# Check database is reachable
npm run db:studio

# Or test via health endpoint
curl https://your-domain.com/api/health | grep database
```

## Monitoring & Maintenance

### Regular Backups
```bash
# Backup PostgreSQL database
pg_dump -U username -d petcare > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -U username -d petcare < backup-20260609.sql
```

### View Application Logs
```bash
# Docker logs
docker logs <container-id>

# Docker Compose logs
docker-compose logs -f app --tail=100
```

### Database Migrations
```bash
# Run pending migrations
npm run db:migrate

# Create new migration
npm run db:migrate:dev -- --name "description"
```

### Performance Monitoring
- Monitor server CPU and memory usage
- Check database query performance
- Review Next.js build output for bundle size
- Enable debug mode with `/api/debug/env-check` (development only)

## Rollback Procedure

### If Deployment Fails
1. Stop the current container: `docker-compose down`
2. Restore previous database backup if needed
3. Deploy previous version: `docker run -d petcare:previous-tag ...`
4. Verify health endpoint: `curl https://your-domain/api/health`
5. Run smoke tests and login verification

### Database Rollback
```bash
# List migration history
npx prisma migrate status

# Rollback last migration (use with caution)
# Manually revert in Prisma migrate system
```

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` format is correct
- Check database server is running and accessible
- Ensure firewall allows connection
- Verify PostgreSQL user has correct permissions

**Authentication Failed**
- Verify `NEXTAUTH_SECRET` is set and matches across instances
- Check `NEXTAUTH_URL` matches deployment domain
- Clear browser cookies and retry
- Check NextAuth logs for session errors

**Email Not Sending**
- Verify SMTP credentials are correct
- Test SMTP connection: `telnet smtp.host 587`
- Check email provider firewall rules
- Review SMTP error logs in application

**SSE Connection Issues**
- Verify browser supports Server-Sent Events
- Check firewall allows keep-alive connections
- Review browser console for connection errors
- Verify `/api/appointment/sse` endpoint is accessible

## Support & Documentation

- **Health Check Endpoint**: `/api/health` - Returns system status and uptime
- **Environment Check** (dev only): `/api/debug/env-check` - Lists required env vars
- **TypeScript Errors**: Run `npm run type-check` before deployment
- **Linting Issues**: Run `npm run lint:fix` to auto-fix style issues

---

**Last Updated**: 2026-06-09
**Version**: 0.1.0
