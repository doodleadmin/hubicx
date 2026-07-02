# Local assets

This directory contains local source materials that are not part of the runtime application.

- `template-source-videos/` - original MP4 files used to prepare optimized template covers. The folder is ignored by Git.
- Production-ready covers live under `webapp/public/app/assets/templates/`.
- Optimize new covers with `cd webapp && npm run optimize:template-media` before committing.

Do not place secrets, database dumps, or production backups here.
