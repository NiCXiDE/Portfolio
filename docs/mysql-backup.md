# Backup y restauración MySQL (Portfolio)

La base corre en Docker (`portfolio-mysql`). Los dumps **no** van a Git: la carpeta `backups/` está en `.gitignore`.

Volumen Docker: `portfolio_mysql_data` → `/var/lib/mysql` (no está en el repositorio).

## Requisitos

- Docker Desktop en ejecución
- Contenedor sano: `docker ps --filter name=portfolio-mysql`

## Encoding (obligatorio)

**No uses pipes de texto de PowerShell** (`Out-File`, `Get-Content | docker exec`) para transportar dumps SQL. En Windows pueden re-codificar Unicode y sustituir acentos por `?` (`0x3F`).

El flujo seguro es **byte-safe**:

1. `mysqldump` / `mysql` escriben o leen **dentro** del contenedor (`/tmp/...`).
2. El host solo copia el archivo con `docker cp`.

Usá siempre `--default-character-set=utf8mb4` en dump y restore.

## Backup (PowerShell / Windows) — byte-safe

```powershell
New-Item -ItemType Directory -Force -Path backups | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out = "backups/portfolio-$stamp.sql"
docker compose up -d
docker exec portfolio-mysql sh -c "mysqldump -uroot -proot --default-character-set=utf8mb4 --single-transaction --routines --triggers portfolio > /tmp/portfolio-dump.sql"
docker cp portfolio-mysql:/tmp/portfolio-dump.sql $out
docker exec portfolio-mysql rm -f /tmp/portfolio-dump.sql
Get-Item $out | Select-Object FullName, Length
# Conteos de CREATE/INSERT (solo verificación; no forman parte del dump)
Select-String -Path $out -Pattern "^CREATE TABLE" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path $out -Pattern "^INSERT" | Measure-Object | Select-Object -ExpandProperty Count
```

## Backup (Bash / Unix) — byte-safe

```bash
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M)
out="backups/portfolio-$stamp.sql"
docker compose up -d
docker exec portfolio-mysql sh -c 'mysqldump -uroot -proot --default-character-set=utf8mb4 --single-transaction --routines --triggers portfolio > /tmp/portfolio-dump.sql'
docker cp portfolio-mysql:/tmp/portfolio-dump.sql "$out"
docker exec portfolio-mysql rm -f /tmp/portfolio-dump.sql
wc -c "$out"
grep -c "^CREATE TABLE" "$out"
grep -c "^INSERT" "$out"
```

> En Unix, `docker exec … mysqldump > archivo` desde el host también suele ser seguro (redirección del shell host en binario). Preferí igualmente `docker cp` para unificar con Windows.

## Restauración (PowerShell / Windows) — byte-safe

```powershell
# Sustituí el nombre del dump. Esto REEMPLAZA el contenido de la DB destino.
$dump = "backups/portfolio-YYYYMMDD-HHMM.sql"
$db = "portfolio"   # o otra DB destino explícita
docker cp $dump portfolio-mysql:/tmp/portfolio-restore.sql
docker exec portfolio-mysql sh -c "mysql -uroot -proot --default-character-set=utf8mb4 $db < /tmp/portfolio-restore.sql"
docker exec portfolio-mysql rm -f /tmp/portfolio-restore.sql
```

## Restauración (Bash / Unix) — byte-safe

```bash
dump="backups/portfolio-YYYYMMDD-HHMM.sql"
db="portfolio"
docker cp "$dump" portfolio-mysql:/tmp/portfolio-restore.sql
docker exec portfolio-mysql sh -c "mysql -uroot -proot --default-character-set=utf8mb4 $db < /tmp/portfolio-restore.sql"
docker exec portfolio-mysql rm -f /tmp/portfolio-restore.sql
```

## Verificación post-restore (opcional)

```powershell
docker exec portfolio-mysql mysql -uroot -proot --default-character-set=utf8mb4 -e "SELECT COUNT(*) AS graphic_items FROM portfolio.graphic_items; SELECT COUNT(*) AS ui_projects FROM portfolio.ui_projects; SELECT COUNT(*) AS brands FROM portfolio.brands;"
# Spot-check Unicode (HEX no debe ser 3F en lugar de C3xx):
docker exec portfolio-mysql mysql -uroot -proot --default-character-set=utf8mb4 -e "SELECT id, name, HEX(name) FROM portfolio.brands WHERE id IN ('ludica','orbita-l-b') LIMIT 5;"
```

## Procedimientos inseguros (no usar)

```powershell
# MAL — re-encodea el dump en el host:
docker exec … mysqldump … | Out-File -Encoding utf8 backups\….sql
Get-Content backups\….sql -Raw | docker exec -i … mysql …
```

## Advertencias

- No ejecutes `npm run db:reset` si necesitás conservar datos: hace `docker compose down -v` y **borra el volumen**.
- No subas archivos de `backups/` al remoto.
- Durante la migración Content Model V2, preferí dumps nombrados (`portfolio-pre-encoding-repair-…`, etc.) y no sobrescribás backups previos.
