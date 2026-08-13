# Backup y restauración MySQL (Portfolio)

La base corre en Docker (`portfolio-mysql`). Los dumps **no** van a Git: la carpeta `backups/` está en `.gitignore`.

Volumen Docker: `portfolio_mysql_data` → `/var/lib/mysql` (no está en el repositorio).

## Requisitos

- Docker Desktop en ejecución
- Contenedor sano: `docker ps --filter name=portfolio-mysql`

## Backup (PowerShell / Windows)

```powershell
New-Item -ItemType Directory -Force -Path backups | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
docker compose up -d
docker exec portfolio-mysql mysqldump -uroot -proot --single-transaction --routines --triggers portfolio | Out-File -Encoding utf8 "backups/portfolio-$stamp.sql"
Get-Item "backups/portfolio-$stamp.sql" | Select-Object FullName, Length
Select-String -Path "backups/portfolio-$stamp.sql" -Pattern "^CREATE TABLE" | Select-Object -First 5
Select-String -Path "backups/portfolio-$stamp.sql" -Pattern "^INSERT" | Select-Object -First 5
```

## Backup (Bash / Unix)

```bash
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M)
docker compose up -d
docker exec portfolio-mysql mysqldump -uroot -proot --single-transaction --routines --triggers portfolio > "backups/portfolio-$stamp.sql"
wc -c "backups/portfolio-$stamp.sql"
grep -c "^CREATE TABLE" "backups/portfolio-$stamp.sql"
grep -c "^INSERT" "backups/portfolio-$stamp.sql"
```

## Restauración (PowerShell / Windows)

```powershell
Get-Content backups/portfolio-YYYYMMDD-HHMM.sql -Raw | docker exec -i portfolio-mysql mysql -uroot -proot portfolio
```

Sustituí `YYYYMMDD-HHMM` por el stamp del archivo. Esto **reemplaza** el contenido de la DB `portfolio` con el del dump.

## Restauración (Bash / Unix)

```bash
docker exec -i portfolio-mysql mysql -uroot -proot portfolio < backups/portfolio-YYYYMMDD-HHMM.sql
```

## Verificación post-restore (opcional)

```powershell
docker exec portfolio-mysql mysql -uroot -proot -e "SELECT COUNT(*) AS graphic_items FROM portfolio.graphic_items; SELECT COUNT(*) AS ui_projects FROM portfolio.ui_projects; SELECT COUNT(*) AS brands FROM portfolio.brands;"
```

## Advertencias

- No ejecutes `npm run db:reset` si necesitás conservar datos: hace `docker compose down -v` y **borra el volumen**.
- No subas archivos de `backups/` al remoto.
