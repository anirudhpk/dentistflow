# Ubuntu Deployment Checklist

Use this for a small single-clinic VPS.

## 1. Provision server

- Ubuntu 24.04 LTS
- 1 vCPU, 1-2 GB RAM
- domain pointed to the server IP

## 2. Install base packages

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx
```

## 3. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

## 4. Clone the app

```bash
git clone <your-repo-url> dentist-app
cd dentist-app
```

## 5. Create production env file

```bash
cp .env.production.example .env.production
```

Fill in:
- `APP_BASE_URL`
- SMTP values
- Gupshup OTP values if using real OTP
- Gupshup WhatsApp values if using WhatsApp document send

## 6. Build and start app

```bash
docker compose build
docker compose up -d
```

## 7. Verify app locally on server

```bash
curl http://127.0.0.1:3000
```

## 8. Configure Nginx

```bash
sudo cp deploy/nginx/dentistflow.conf /etc/nginx/sites-available/dentistflow
sudo ln -s /etc/nginx/sites-available/dentistflow /etc/nginx/sites-enabled/dentistflow
sudo nginx -t
sudo systemctl reload nginx
```

Update the `server_name` in the config first.

## 9. Enable HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 10. Verify production flows

- login page opens
- OTP send works
- OTP verify works
- add patient works
- patient search works
- prescription PDF opens
- invoice PDF opens
- send prescription button returns expected status

## 11. Protect and operate

- keep `.env.production` off git
- back up `./data/dentistflow.sqlite`
- run updates with:

```bash
git pull
docker compose build
docker compose up -d
```

## 12. Recommended next upgrades

- move from SQLite to Postgres
- add off-server backups
- add monitoring and error reporting
- add staff roles and stronger authentication
