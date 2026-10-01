#!/bin/sh
# Daily PostgreSQL dump of the Hubicx database, kept for 14 days.
# Install: cp ops/backup/pg-backup.sh /usr/local/bin/ && chmod +x /usr/local/bin/pg-backup.sh
#          echo '0 4 * * * root /usr/local/bin/pg-backup.sh' > /etc/cron.d/hubicx-backup
set -eu
DIR=/opt/backups
mkdir -p "$DIR"
cd /opt/ai_aggregator
FILE="$DIR/ai_aggregator-$(date +%Y%m%d-%H%M).sql.gz"
docker compose exec -T postgres pg_dump -U postgres ai_aggregator | gzip > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'ai_aggregator-*.sql.gz' -mtime +14 -delete
