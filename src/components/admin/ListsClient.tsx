"use client";

import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { saveHomeLayout, saveNamedList } from "@/app/admin/actions";
import { uploadLocalAsset } from "@/app/admin/upload-local";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { pushAdminToast } from "@/lib/admin-toast";
import type { NamedListKind } from "@/db/entities";
import type { BrandRef } from "@/lib/brands";
import {
  HOME_SECTION_LABELS,
  type HomeLayoutConfig,
  type HomeSectionId,
  type MarqueeDisplayMode,
  type MarqueeDirection,
  type MarqueeSectionConfig,
} from "@/lib/home-layout";

export type NamedListAdminItem = {
  id?: number;
  label: string;
  logoPath: string | null;
  brandId?: string | null;
  createdAt?: string | null;
};

type Props = {
  initialLayout: HomeLayoutConfig;
  lists: Record<NamedListKind, NamedListAdminItem[]>;
  brands: BrandRef[];
};

const KINDS: { kind: NamedListKind; title: string }[] = [
  { kind: "company", title: "Empresas / instituciones" },
  { kind: "past_project", title: "Proyectos pasados" },
  { kind: "current_project", title: "Proyectos actuales" },
];

type SortMode = "manual" | "date-desc" | "date-asc" | "alpha" | "alpha-rev";

type DraftItem = {
  key: string;
  label: string;
  logoPath: string;
  brandId: string;
  createdAt: string;
};

type ReplacePending = {
  index: number;
  file: File;
  previewUrl: string;
};

function newKey() {
  return `n-${Math.random().toString(36).slice(2, 9)}`;
}

function toDrafts(items: NamedListAdminItem[]): DraftItem[] {
  return items.map((item, i) => ({
    key: item.id != null ? `id-${item.id}` : `i-${i}-${newKey()}`,
    label: item.label,
    logoPath: item.logoPath ?? "",
    brandId: item.brandId ?? "",
    createdAt: item.createdAt ?? new Date(0).toISOString(),
  }));
}

function isIncomplete(item: DraftItem, mode: MarqueeDisplayMode) {
  const hasName = Boolean(item.label.trim());
  const hasLogo = Boolean(item.logoPath.trim());
  if (mode === "name") return !hasName;
  if (mode === "logo") return !hasLogo;
  return !hasName || !hasLogo;
}

function incompleteReason(item: DraftItem, mode: MarqueeDisplayMode) {
  const hasName = Boolean(item.label.trim());
  const hasLogo = Boolean(item.logoPath.trim());
  if (mode === "name") return !hasName ? "sin nombre" : null;
  if (mode === "logo") return !hasLogo ? "sin logo" : null;
  if (!hasName && !hasLogo) return "sin nombre ni logo";
  if (!hasName) return "sin nombre";
  if (!hasLogo) return "sin logo";
  return null;
}

function DisplayModeToggle({
  value,
  onChange,
}: {
  value: MarqueeDisplayMode;
  onChange: (v: MarqueeDisplayMode) => void;
}) {
  const options: {
    id: MarqueeDisplayMode;
    label: string;
    icon: typeof Type;
  }[] = [
    { id: "name", label: "Nombre", icon: Type },
    { id: "logo", label: "Marcas", icon: ImageIcon },
    { id: "both", label: "Ambos", icon: Images },
  ];

  return (
    <div className="block min-w-[17.5rem] space-y-1 text-sm sm:min-w-[19rem]">
      <FieldLabel hint="Qué se muestra en el marquee del sitio">Mostrar</FieldLabel>
      <div
        role="radiogroup"
        aria-label="Modo de visualización"
        className="flex h-[2.375rem] w-full border border-ink/20 bg-white"
      >
        {options.map(({ id, label, icon: Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              title={label}
              onClick={() => onChange(id)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-2.5 text-xs leading-none transition-colors ${
                active
                  ? "bg-ink text-sky-pale"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MarqueeControls({
  config,
  onChange,
}: {
  config: MarqueeSectionConfig;
  onChange: (next: MarqueeSectionConfig) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="block w-24 text-sm">
        <FieldLabel>Líneas</FieldLabel>
        <input
          type="number"
          min={1}
          max={12}
          value={config.lines}
          onChange={(e) =>
            onChange({
              ...config,
              lines: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
            })
          }
          className={fieldClass}
        />
      </label>
      <label className="block w-40 text-sm">
        <FieldLabel>Dirección</FieldLabel>
        <select
          value={config.direction}
          onChange={(e) =>
            onChange({
              ...config,
              direction: e.target.value as MarqueeDirection,
            })
          }
          className={selectClass}
        >
          <option value="left">Izquierda ←</option>
          <option value="right">Derecha →</option>
        </select>
      </label>
      <label className="block w-28 text-sm">
        <FieldLabel hint="Pixeles por segundo">Velocidad</FieldLabel>
        <input
          type="number"
          min={8}
          max={200}
          value={config.speed}
          onChange={(e) =>
            onChange({
              ...config,
              speed: Math.max(8, Math.min(200, Number(e.target.value) || 8)),
            })
          }
          className={fieldClass}
        />
      </label>
      <DisplayModeToggle
        value={config.displayMode}
        onChange={(displayMode) => onChange({ ...config, displayMode })}
      />
    </div>
  );
}

function SortToolbar({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
}) {
  const btn = (id: SortMode, label: string, icon: typeof ArrowDownAZ) => {
    const Icon = icon;
    const active = mode === id;
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={active}
        onClick={() => onChange(id)}
        className={`flex size-8 items-center justify-center transition-colors ${
          active
            ? "bg-ink text-sky-pale"
            : "border border-ink/15 text-ink hover:bg-ink/5"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={1.75} />
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-xs text-ink/50">Ordenar</span>
      {btn("date-desc", "Más recientes primero", CalendarArrowDown)}
      {btn("date-asc", "Más antiguos primero", CalendarArrowUp)}
      {btn("alpha", "A → Z", ArrowDownAZ)}
      {btn("alpha-rev", "Z → A", ArrowUpAZ)}
    </div>
  );
}

function applySort(items: DraftItem[], mode: SortMode): DraftItem[] {
  if (mode === "manual") return items;
  const copy = [...items];
  if (mode === "date-desc") {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (mode === "date-asc") {
    copy.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (mode === "alpha") {
    copy.sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  } else if (mode === "alpha-rev") {
    copy.sort((a, b) =>
      b.label.localeCompare(a.label, "es", { sensitivity: "base" }),
    );
  }
  return copy;
}

function ReplaceLogoModal({
  pending,
  current,
  busy,
  onCancel,
  onConfirm,
}: {
  pending: ReplacePending;
  current: DraftItem;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="replace-logo-title"
    >
      <div className="w-full max-w-md border border-ink/10 bg-white p-5 shadow-[0_12px_40px_rgba(64,65,121,0.18)]">
        <h3
          id="replace-logo-title"
          className="font-admin-title text-xl text-ink"
        >
          ¿Reemplazar logo?
        </h3>
        <p className="mt-2 text-sm text-ink/70">
          Vas a cambiar el logo de{" "}
          <span className="font-medium text-ink">
            {current.label.trim() || "este ítem"}
          </span>
          .
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-ink/45">
              Actual
            </span>
            <div className="flex size-24 items-center justify-center border border-ink/10 bg-sky-pale/50 p-2">
              {current.logoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.logoPath}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-ink/40">Sin logo</span>
              )}
            </div>
          </div>
          <span className="text-ink/35">→</span>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-ink/45">
              Nuevo
            </span>
            <div className="flex size-24 items-center justify-center border border-ink/10 bg-sky-pale/50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pending.previewUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 truncate text-xs text-ink/50" title={pending.file.name}>
          Archivo: {pending.file.name}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="border border-ink/20 px-3 py-2 text-sm text-ink hover:bg-ink/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-ink px-3 py-2 text-sm text-sky-pale disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Reemplazar
          </button>
        </div>
      </div>
    </div>
  );
}

function ListEditor({
  kind,
  title,
  initialItems,
  initialConfig,
  brands,
}: {
  kind: NamedListKind;
  title: string;
  initialItems: NamedListAdminItem[];
  initialConfig: MarqueeSectionConfig;
  brands: BrandRef[];
}) {
  const [items, setItems] = useState(() => toDrafts(initialItems));
  const [config, setConfig] = useState(initialConfig);
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [fileOverIndex, setFileOverIndex] = useState<number | null>(null);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [replacePending, setReplacePending] = useState<ReplacePending | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const incomplete = useMemo(
    () =>
      items
        .map((item, index) => ({
          index,
          item,
          reason: incompleteReason(item, config.displayMode),
        }))
        .filter((row) => row.reason),
    [items, config.displayMode],
  );

  function setLogo(index: number, path: string) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, logoPath: path } : row)),
    );
  }

  async function uploadFile(file: File, index: number) {
    setBusyIndex(index);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "assets/inicio/lists");
      const res = await uploadLocalAsset(fd);
      if (!res.ok) {
        setUploadError(res.error);
        return;
      }
      setLogo(index, res.path);
    } catch {
      setUploadError("No se pudo subir. Probá de nuevo.");
    } finally {
      setBusyIndex(null);
    }
  }

  function offerFile(file: File | undefined, index: number) {
    if (!file || !file.type.startsWith("image/")) return;
    const current = items[index];
    if (current?.logoPath) {
      const previewUrl = URL.createObjectURL(file);
      setReplacePending({ index, file, previewUrl });
      return;
    }
    void uploadFile(file, index);
  }

  function confirmReplace() {
    if (!replacePending) return;
    const { index, file, previewUrl } = replacePending;
    URL.revokeObjectURL(previewUrl);
    setReplacePending(null);
    void uploadFile(file, index);
  }

  function cancelReplace() {
    if (replacePending) URL.revokeObjectURL(replacePending.previewUrl);
    setReplacePending(null);
  }

  function onSortChange(mode: SortMode) {
    setSortMode(mode);
    if (mode !== "manual") setItems((prev) => applySort(prev, mode));
  }

  function onItemDragStart(index: number, e: DragEvent) {
    e.dataTransfer.setData("text/list-index", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDragIndex(index);
  }

  function onItemDragOver(index: number, e: DragEvent) {
    e.preventDefault();
    const isFile = Array.from(e.dataTransfer.types).includes("Files");
    if (isFile) {
      setFileOverIndex(index);
      e.dataTransfer.dropEffect = "copy";
      return;
    }
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }

  function onItemDrop(index: number, e: DragEvent) {
    e.preventDefault();
    setFileOverIndex(null);
    setOverIndex(null);
    setDragIndex(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      offerFile(file, index);
      return;
    }

    const fromRaw = e.dataTransfer.getData("text/list-index");
    const from = Number(fromRaw);
    if (!Number.isFinite(from) || from === index) return;
    setSortMode("manual");
    setItems((prev) => {
      const copy = [...prev];
      const [row] = copy.splice(from, 1);
      copy.splice(index, 0, row);
      return copy;
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (incomplete.length) {
      e.preventDefault();
    }
  }

  return (
    <form
      action={saveNamedList}
      onSubmit={onSubmit}
      className="space-y-4 border border-ink/10 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <SortToolbar mode={sortMode} onChange={onSortChange} />
      </div>

      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="lines" value={config.lines} />
      <input type="hidden" name="direction" value={config.direction} />
      <input type="hidden" name="speed" value={config.speed} />
      <input type="hidden" name="displayMode" value={config.displayMode} />
      <input
        type="hidden"
        name="itemsJson"
        value={JSON.stringify(
          items
            .map((i) => ({
              label: i.label.trim(),
              logoPath: i.logoPath.trim() || null,
              brandId: i.brandId.trim() || null,
              createdAt: i.createdAt,
            }))
            .filter((i) => i.label),
        )}
      />

      <MarqueeControls config={config} onChange={setConfig} />

      {incomplete.length ? (
        <div className="flex gap-2 border border-alert-warning bg-[#fffcef] px-3 py-2 text-sm text-ink">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-ink"
            strokeWidth={1.75}
          />
          <div>
            <p className="font-medium">
              {incomplete.length} ítem
              {incomplete.length === 1 ? "" : "s"} incompleto
              {incomplete.length === 1 ? "" : "s"} para el modo actual
            </p>
            <ul className="mt-1 list-disc pl-4 text-xs text-ink/70">
              {incomplete.slice(0, 6).map(({ item, reason, index }) => (
                <li key={item.key}>
                  #{index + 1} {item.label.trim() || "(sin nombre)"} — {reason}
                </li>
              ))}
              {incomplete.length > 6 ? (
                <li>…y {incomplete.length - 6} más</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}

      {uploadError ? (
        <p className="text-sm text-red-700">{uploadError}</p>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs leading-relaxed text-ink/55">
          Arrastrá el asa para reordenar. Soltá una imagen sobre un ítem para
          cargar o reemplazar el logo.
        </p>

        {items.map((item, index) => {
          const incompleteRow = isIncomplete(item, config.displayMode);
          const dragging = dragIndex === index;
          const fileOver = fileOverIndex === index;
          const sortedOver = overIndex === index && dragIndex !== index;

          return (
            <div
              key={item.key}
              onDragOver={(e) => onItemDragOver(index, e)}
              onDragLeave={() => {
                setFileOverIndex((v) => (v === index ? null : v));
                setOverIndex((v) => (v === index ? null : v));
              }}
              onDrop={(e) => onItemDrop(index, e)}
              className={`list-item-row grid grid-cols-[1.75rem_4.5rem_minmax(0,1fr)_2rem] items-center gap-3 border bg-white p-2 transition-colors sm:grid-cols-[1.75rem_5rem_minmax(0,1fr)_2rem] ${
                incompleteRow
                  ? "border-alert-warning"
                  : fileOver
                    ? "border-ink bg-sky-pale"
                    : sortedOver
                      ? "border-ink/40"
                      : "border-ink/10"
              } ${dragging ? "opacity-50" : ""}`}
            >
              <button
                type="button"
                aria-label="Arrastrar para reordenar"
                draggable
                onDragStart={(e) => onItemDragStart(index, e)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className="flex size-7 cursor-grab items-center justify-center justify-self-center text-ink/35 active:cursor-grabbing hover:text-ink/60"
              >
                <GripVertical className="size-4" strokeWidth={1.5} />
              </button>

              <div
                className="relative aspect-square w-full justify-self-center border border-dashed border-ink/20 bg-sky-pale/40"
                onClick={() => fileInputRefs.current[item.key]?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRefs.current[item.key]?.click();
                  }
                }}
              >
                {busyIndex === index ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-ink/40" />
                  </div>
                ) : item.logoPath ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logoPath}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0.5 left-0.5 right-0.5 bg-white/90 text-[9px] leading-tight text-ink/60 underline hover:text-ink"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogo(index, "");
                      }}
                    >
                      Quitar
                    </button>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-0.5 px-1 text-center">
                    <ImagePlus
                      className="size-5 text-ink/30"
                      strokeWidth={1.5}
                    />
                    <span className="text-[10px] leading-none text-ink/45">
                      Logo
                    </span>
                  </div>
                )}
                <input
                  ref={(el) => {
                    fileInputRefs.current[item.key] = el;
                  }}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg"
                  className="hidden"
                  onChange={(e) => {
                    offerFile(e.target.files?.[0], index);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <label className="block">
                  <FieldLabel>Nombre</FieldLabel>
                  <input
                    value={item.label}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === index
                            ? { ...row, label: e.target.value }
                            : row,
                        ),
                      )
                    }
                    className={fieldClass}
                    placeholder="Nombre / etiqueta"
                  />
                </label>
                {brands.length ? (
                  <label className="block">
                    <span className="text-[10px] text-ink/45">Marca</span>
                    <select
                      value={item.brandId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const brand = brands.find((b) => b.id === id);
                        setItems((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  brandId: id,
                                  label: brand
                                    ? brand.name
                                    : row.label,
                                  logoPath: brand
                                    ? brand.logoPath || brand.logo || row.logoPath
                                    : row.logoPath,
                                }
                              : row,
                          ),
                        );
                      }}
                      className={`${selectClass} py-1 text-xs`}
                    >
                      <option value="">Manual</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Eliminar"
                onClick={() => {
                  const removed = items[index];
                  setItems((prev) => prev.filter((_, i) => i !== index));
                  pushAdminToast({
                    message: removed?.label.trim()
                      ? `Quitado “${removed.label.trim()}” (guardá para confirmar)`
                      : "Ítem quitado de la lista (guardá para confirmar)",
                    variant: "danger",
                    undoable: false,
                  });
                }}
                className="flex size-8 items-center justify-center justify-self-center border border-ink/15 text-ink hover:border-alert-danger/40 hover:bg-[#fff5f5]"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                key: newKey(),
                label: "",
                logoPath: "",
                brandId: "",
                createdAt: new Date().toISOString(),
              },
            ])
          }
          className="inline-flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-sm text-ink hover:bg-ink/5"
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Agregar ítem
        </button>
      </div>

      <button
        type="submit"
        disabled={incomplete.length > 0}
        className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-sky-pale disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Save className="size-3.5" strokeWidth={1.75} />
        Guardar {title}
      </button>

      {replacePending ? (
        <ReplaceLogoModal
          pending={replacePending}
          current={items[replacePending.index]}
          busy={busyIndex === replacePending.index}
          onCancel={cancelReplace}
          onConfirm={confirmReplace}
        />
      ) : null}
    </form>
  );
}

export function ListsClient({ initialLayout, lists, brands }: Props) {
  const [order, setOrder] = useState<HomeSectionId[]>(
    initialLayout.sectionOrder,
  );
  const [dragSection, setDragSection] = useState<number | null>(null);

  const layoutPayload: HomeLayoutConfig = {
    sectionOrder: order,
    marquees: initialLayout.marquees,
  };

  return (
    <div className="space-y-10">
      <form
        action={saveHomeLayout}
        className="space-y-4 border border-ink/10 p-4"
      >
        <h2 className="text-lg font-bold">Orden de secciones (Home)</h2>
        <p className="text-sm text-ink/65">
          Arrastrá para definir qué bloque aparece primero después del bio.
        </p>
        <input
          type="hidden"
          name="homeLayout"
          value={JSON.stringify(layoutPayload)}
        />
        <ul className="space-y-2">
          {order.map((id, index) => (
            <li
              key={id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/section-index", String(index));
                setDragSection(index);
              }}
              onDragEnd={() => setDragSection(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(
                  e.dataTransfer.getData("text/section-index"),
                );
                if (!Number.isFinite(from) || from === index) return;
                setOrder((prev) => {
                  const copy = [...prev];
                  const [row] = copy.splice(from, 1);
                  copy.splice(index, 0, row);
                  return copy;
                });
                setDragSection(null);
              }}
              className={`flex cursor-grab items-center gap-2 border border-ink/10 bg-white px-3 py-2 active:cursor-grabbing ${
                dragSection === index ? "opacity-50" : ""
              }`}
            >
              <GripVertical
                className="size-4 shrink-0 text-ink/30"
                strokeWidth={1.5}
              />
              <span className="flex-1 text-sm font-medium text-ink">
                {HOME_SECTION_LABELS[id]}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-sky-pale"
        >
          <Save className="size-3.5" strokeWidth={1.75} />
          Guardar orden
        </button>
      </form>

      {KINDS.map(({ kind, title }) => (
        <ListEditor
          key={kind}
          kind={kind}
          title={title}
          initialItems={lists[kind]}
          initialConfig={initialLayout.marquees[kind]}
          brands={brands}
        />
      ))}
    </div>
  );
}
