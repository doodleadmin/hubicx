#!/bin/sh
# Issues / extends the Let's Encrypt certificate once the domains point at this server.
# Runs from cron every 10 minutes (see /etc/cron.d/hubicx-tls); does nothing until DNS is right,
# so it never burns Let's Encrypt validation attempts.
set -u
IP="${HUBICX_IP:-185.253.7.71}"
REQUIRED="hubicx.ru api.hubicx.ru webapp.hubicx.ru"
OPTIONAL="www.hubicx.ru admin.hubicx.ru"
STATE=/var/lib/hubicx-tls-domains
LOG=/var/log/hubicx-tls.log

resolves_here() { getent ahostsv4 "$1" 2>/dev/null | awk '{print $1}' | grep -qx "$IP"; }

domains=""
for d in $REQUIRED; do
  resolves_here "$d" || { echo "$(date -u +%FT%TZ) waiting: $d does not point to $IP yet" >> "$LOG"; exit 0; }
  domains="$domains $d"
done
for d in $OPTIONAL; do resolves_here "$d" && domains="$domains $d"; done

domains=$(echo $domains | tr ' ' '\n' | sort | tr '\n' ' ' | sed 's/ $//')
if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$domains" ] && [ -d /etc/letsencrypt/live/hubicx.ru ]; then
  exit 0
fi

args=""
for d in $domains; do args="$args -d $d"; done
echo "$(date -u +%FT%TZ) requesting certificate for:$args" >> "$LOG"
if certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
     --cert-name hubicx.ru --expand --redirect $args >> "$LOG" 2>&1; then
  echo "$domains" > "$STATE"
  echo "$(date -u +%FT%TZ) certificate ready" >> "$LOG"
else
  echo "$(date -u +%FT%TZ) certbot failed, will retry" >> "$LOG"
fi
