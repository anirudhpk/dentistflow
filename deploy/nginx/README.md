# Nginx Setup

Use [`dentistflow.conf`](/Users/anirudhpk/dentist-app/deploy/nginx/dentistflow.conf) as the base reverse-proxy config for the app.

## Typical install path

```bash
sudo cp deploy/nginx/dentistflow.conf /etc/nginx/sites-available/dentistflow
sudo ln -s /etc/nginx/sites-available/dentistflow /etc/nginx/sites-enabled/dentistflow
sudo nginx -t
sudo systemctl reload nginx
```

## After DNS is live

Use Certbot to add HTTPS:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
