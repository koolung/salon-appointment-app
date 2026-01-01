# Deployment & Production Checklist

## Pre-Deployment Requirements

### Infrastructure Setup
- [ ] Secure PostgreSQL database provisioned
- [ ] Redis instance configured (optional but recommended)
- [ ] Server/VPS provisioned (Vercel, AWS, Heroku, etc.)
- [ ] Domain name registered
- [ ] SSL certificate acquired (Let's Encrypt free option available)
- [ ] Email service configured (SendGrid, AWS SES, Gmail, etc.)
- [ ] Payment processor account (Stripe recommended)
- [ ] Cloud storage configured (S3, Cloudinary for images)

### Security Configuration
- [ ] JWT_SECRET changed to strong random value (use: `openssl rand -base64 32`)
- [ ] Database password set to strong value
- [ ] Database backups automated (daily recommended)
- [ ] CORS configured for production domain only
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] Security headers configured:
  - Strict-Transport-Security
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
- [ ] Rate limiting enabled
- [ ] API keys & secrets stored in environment variables
- [ ] Database encryption at rest enabled

### Code & Deployment
- [ ] All secrets removed from repository
- [ ] Environment variables documented in `.env.example`
- [ ] Production build tested locally
- [ ] Database migrations tested on production schema
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Monitoring set up (New Relic, DataDog, etc.)
- [ ] CI/CD pipeline configured (GitHub Actions, GitLab CI, etc.)
- [ ] Automated testing in pipeline
- [ ] Code review process established

### Performance Optimization
- [ ] Database queries optimized with indexes
- [ ] API response times verified (< 200ms target)
- [ ] Frontend assets minified and compressed
- [ ] Images optimized and lazy-loaded
- [ ] CDN configured for static assets
- [ ] Database connection pooling configured
- [ ] Caching strategy implemented (Redis)
- [ ] Load testing performed (k6, Artillery)

### Testing
- [ ] Unit tests passing (95%+ coverage goal)
- [ ] Integration tests passing
- [ ] E2E tests passing for critical flows
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified
- [ ] Performance testing completed
- [ ] Security testing completed (OWASP Top 10)
- [ ] Load testing (concurrent users target)

### Monitoring & Alerts
- [ ] Application error tracking (Sentry)
- [ ] Performance monitoring (APM)
- [ ] Database monitoring
- [ ] Uptime monitoring
- [ ] Alert rules configured for:
  - High error rates
  - Slow API responses
  - Database issues
  - Disk space warnings
  - Memory usage alerts
- [ ] Logs aggregated (ELK, CloudWatch, etc.)

---

## Deployment Checklist by Environment

### Development Environment
- [ ] Docker Compose working
- [ ] Hot reload enabled
- [ ] Debug mode configured
- [ ] Test data seeded

### Staging Environment
- [ ] Identical to production
- [ ] Production database structure (anonymized data)
- [ ] All integrations tested
- [ ] Performance baseline established
- [ ] Team access configured
- [ ] Backup & restore procedures tested

### Production Environment

#### Pre-Launch
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Load balancer configured
- [ ] Auto-scaling rules set
- [ ] Database backups automated
- [ ] Disaster recovery plan documented
- [ ] Rollback plan documented
- [ ] Deployment procedure documented

#### Application
- [ ] NODE_ENV=production
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Static assets served efficiently
- [ ] API rate limiting enforced
- [ ] CORS configured correctly
- [ ] Health check endpoint available
- [ ] Graceful shutdown handling

#### Post-Launch
- [ ] Smoke tests run
- [ ] Key workflows verified
- [ ] Email confirmations working
- [ ] Payments tested (test mode first)
- [ ] Availability calculations correct
- [ ] Reports generating correctly
- [ ] Notifications sending
- [ ] Admin can log in and access features

---

## Environment Variables Checklist

### Backend Production (.env)
```
DATABASE_URL=postgresql://user:STRONG_PASSWORD@db.example.com:5432/salon_booking_prod
JWT_SECRET=STRONG_RANDOM_VALUE_HERE
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
SMTP_FROM=noreply@yourdomain.com

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

REDIS_URL=redis://redis.example.com:6379

SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

S3_ACCESS_KEY_ID=xxxxx
S3_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET=salon-booking-prod
S3_REGION=us-east-1
```

### Frontend Production (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Deployment Steps

### Option 1: Heroku (Easiest)

```bash
# 1. Login
heroku login

# 2. Create app
heroku create salon-booking-prod

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 4. Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set SMTP_HOST=smtp.sendgrid.net
# ... set all required variables

# 5. Add buildpack for Node
heroku buildpacks:add heroku/nodejs

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run npx prisma migrate deploy

# 8. View logs
heroku logs --tail
```

### Option 2: AWS EC2

```bash
# 1. Connect to instance
ssh -i key.pem ec2-user@your-instance-ip

# 2. Install dependencies
sudo yum update
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Install PostgreSQL
sudo yum install -y postgresql-server

# 4. Clone repository
git clone <repo-url>
cd salon-booking

# 5. Install dependencies
npm install

# 6. Configure environment
nano .env
# Add all production variables

# 7. Build application
npm run build

# 8. Set up PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name salon-booking

# 9. Enable startup on reboot
pm2 startup
pm2 save
```

### Option 3: Docker on VPS

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clone repository
git clone <repo-url>
cd salon-booking

# 4. Create .env files
cp backend/.env.example backend/.env
# Edit with production variables

# 5. Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 6. View logs
docker-compose logs -f
```

### Option 4: Vercel + Railway

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel --prod
# Configure environment in Vercel dashboard
```

**Backend (Railway):**
```bash
# 1. Sign up at railway.app
# 2. Connect GitHub repo
# 3. Configure environment variables
# 4. Deploy
```

---

## Post-Deployment Verification

### Application Health
- [ ] Frontend loads (https://yourdomain.com)
- [ ] API responds (https://api.yourdomain.com/health)
- [ ] Database connection working
- [ ] Can register new user
- [ ] Can log in with account
- [ ] Can view services
- [ ] Can book appointment
- [ ] Confirmation email received
- [ ] Admin dashboard accessible

### Integrations
- [ ] Email notifications sending
- [ ] Payment processing working (test transaction)
- [ ] Calendar integration functional (if implemented)
- [ ] External API calls working
- [ ] Webhooks receiving data (if configured)

### Performance
- [ ] Webpage load time < 3 seconds
- [ ] API response time < 200ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] CPU usage reasonable

### Security
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Sensitive data not exposed
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] CSRF protection working

---

## Monitoring Setup

### Uptime Monitoring
```bash
# Use services like:
- UptimeRobot (free)
- Pingdom
- StatusPage.io
```

### Error Tracking
```bash
# Sentry setup
npm install @sentry/node
```

### Performance Monitoring
```bash
# APM options:
- New Relic
- DataDog
- Elastic APM
- Grafana
```

### Log Aggregation
```bash
# ELK Stack or:
- CloudWatch (AWS)
- Stackdriver (GCP)
- Azure Monitor
```

---

## Scaling Plan

### Phase 1: Single Server (0-1000 users)
- ✅ Current setup
- PostgreSQL single instance
- Redis optional

### Phase 2: Load Balancing (1000-10000 users)
- Add load balancer (nginx, HAProxy)
- Database read replicas
- Redis for caching
- CDN for static assets

### Phase 3: Microservices (10000+ users)
- Separate API servers
- Dedicated payments service
- Dedicated notifications service
- Database sharding

---

## Disaster Recovery

### Backup Strategy
```bash
# Daily automated backups
- Database: 7-day rolling + 1 monthly
- Application: Git tags for releases
- Static files: S3 versioning enabled
```

### Restore Procedure
```bash
1. Stop application
2. Restore latest database backup
3. Verify data integrity
4. Restart application
5. Run smoke tests
```

### Zero-Downtime Deployment
```bash
1. Deploy new code to staging
2. Run all tests
3. Use blue-green deployment:
   - Keep current version (blue) running
   - Deploy new version (green)
   - Test new version
   - Switch traffic to green
   - Keep blue as fallback
```

---

## Maintenance Schedule

### Daily
- [ ] Monitor error rates
- [ ] Check database size
- [ ] Verify backups completed

### Weekly
- [ ] Review logs for issues
- [ ] Check performance metrics
- [ ] Update dependencies (security patches)
- [ ] Test backup restoration

### Monthly
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning

### Quarterly
- [ ] Full disaster recovery test
- [ ] Security assessment
- [ ] Cost optimization
- [ ] Scaling evaluation

---

## Rollback Plan

If production deployment fails:

```bash
# 1. Identify last working version
git log --oneline | head

# 2. Revert code
git revert <commit-hash>
git push origin main

# 3. Redeploy
# (Heroku: auto-deploys on push)
# (Docker: rebuild and restart)

# 4. If database issues
npx prisma migrate resolve --rolled-back <migration>

# 5. Verify application
# Run smoke tests
```

---

## Support & Troubleshooting

### Common Issues

**High Memory Usage**
- Check for memory leaks
- Restart application
- Scale up resources

**Database Connection Errors**
- Verify connection string
- Check database is running
- Verify network access
- Check connection pool settings

**Email Not Sending**
- Verify SMTP credentials
- Check email service provider
- Review email queue
- Check spam folder

**Slow API Responses**
- Check database query performance
- Enable caching
- Add database indexes
- Review application logs

**Payment Failures**
- Verify Stripe API keys
- Check payment mode (test vs live)
- Review Stripe logs
- Test with Stripe test cards

---

## Final Checklist

- [ ] Domain pointing to server
- [ ] SSL certificate installed and renewing
- [ ] All environment variables set
- [ ] Database backups automated
- [ ] Monitoring active
- [ ] Alert rules configured
- [ ] Support email configured
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified
- [ ] Team access configured
- [ ] Documentation up to date
- [ ] Runbooks created for common issues
- [ ] On-call schedule configured
- [ ] Incident response plan documented

---

**Deployment Ready!** 🚀

Once all items are checked, your salon booking platform is ready for production.

**Deployment Date:** ___________
**Deployed By:** ___________
**Approval By:** ___________
