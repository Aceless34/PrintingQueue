import { useEffect, useMemo, useState } from "react";
import { fetchRollUsage } from "../api/client";

const defaultDraft = {
  colorId: "",
  label: "",
  gramsTotal: "",
  spoolWeightGrams: "",
  weightCurrentGrams: "",
  purchasePrice: "",
  purchasedAt: "",
  openedAt: "",
  lastDriedAt: "",
  needsDrying: false,
};

export default function FilamentRollsPanel({
  colors,
  rolls,
  addingRoll,
  newRoll,
  onNewRollChange,
  onSubmit,
  onUpdateRoll,
  focusRollId,
  rollLinkBase,
}) {
  const focusedRoll = useMemo(
    () => rolls.find((roll) => roll.id === focusRollId) || null,
    [rolls, focusRollId]
  );
  const [quickDraft, setQuickDraft] = useState({
    label: "",
    spoolWeightGrams: "",
    weightCurrentGrams: "",
    gramsTotal: "",
    gramsRemaining: "",
    purchasePrice: "",
    purchasedAt: "",
    openedAt: "",
    lastDriedAt: "",
    needsDrying: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDraft, setEditDraft] = useState(defaultDraft);
  const [editId, setEditId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRoll, setHistoryRoll] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  useEffect(() => {
    if (!focusedRoll) return;
    setQuickDraft({
      label: focusedRoll.label || "",
      spoolWeightGrams:
        focusedRoll.spool_weight_grams !== null
          ? String(focusedRoll.spool_weight_grams)
          : "",
      weightCurrentGrams:
        focusedRoll.weight_current_grams !== null
          ? String(focusedRoll.weight_current_grams)
          : "",
      gramsTotal:
        focusedRoll.grams_total !== null ? String(focusedRoll.grams_total) : "",
      gramsRemaining:
        focusedRoll.grams_remaining !== null
          ? String(focusedRoll.grams_remaining)
          : "",
      purchasePrice:
        focusedRoll.purchase_price !== null
          ? String(focusedRoll.purchase_price)
          : "",
      purchasedAt: focusedRoll.purchased_at || "",
      openedAt: focusedRoll.opened_at || "",
      lastDriedAt: focusedRoll.last_dried_at || "",
      needsDrying: Boolean(focusedRoll.needs_drying),
    });
  }, [focusedRoll]);

  useEffect(() => {
    if (!showAddModal) return;
    setTimeout(() => {
      const firstInput = document.querySelector(
        "[data-roll-modal='add'] input, [data-roll-modal='add'] select"
      );
      if (firstInput) firstInput.focus();
    }, 0);
  }, [showAddModal]);

  const handleQuickChange = (event) => {
    const { name, value } = event.target;
    setQuickDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitQuickUpdate = async () => {
    if (!focusedRoll) return;
    const payload = {};
    if (quickDraft.label !== "") payload.label = quickDraft.label;
    if (quickDraft.spoolWeightGrams !== "") {
      payload.spoolWeightGrams = quickDraft.spoolWeightGrams;
    } else {
      payload.spoolWeightGrams = null;
    }
    if (quickDraft.weightCurrentGrams !== "") {
      payload.weightCurrentGrams = quickDraft.weightCurrentGrams;
    } else {
      payload.weightCurrentGrams = null;
    }
    if (quickDraft.gramsTotal !== "") payload.gramsTotal = quickDraft.gramsTotal;
    if (quickDraft.gramsRemaining !== "") {
      payload.gramsRemaining = quickDraft.gramsRemaining;
    }
    if (quickDraft.purchasePrice !== "") {
      payload.purchasePrice = quickDraft.purchasePrice;
    } else {
      payload.purchasePrice = null;
    }
    payload.purchasedAt = quickDraft.purchasedAt || null;
    payload.openedAt = quickDraft.openedAt || null;
    payload.lastDriedAt = quickDraft.lastDriedAt || null;
    payload.needsDrying = quickDraft.needsDrying;

    await onUpdateRoll(focusedRoll.id, payload);
  };

  const buildRollLink = (rollId) => {
    if (!rollLinkBase) return "";
    return `${rollLinkBase}?rollId=${rollId}`;
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (roll) => {
    setEditId(roll.id);
    setEditDraft({
      colorId: String(roll.color_id || ""),
      label: roll.label || "",
      gramsTotal: roll.grams_total !== null ? String(roll.grams_total) : "",
      spoolWeightGrams:
        roll.spool_weight_grams !== null
          ? String(roll.spool_weight_grams)
          : "",
      weightCurrentGrams:
        roll.weight_current_grams !== null
          ? String(roll.weight_current_grams)
          : "",
      purchasePrice:
        roll.purchase_price !== null ? String(roll.purchase_price) : "",
      purchasedAt: roll.purchased_at || "",
      openedAt: roll.opened_at || "",
      lastDriedAt: roll.last_dried_at || "",
      needsDrying: Boolean(roll.needs_drying),
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (event) => {
    event.preventDefault();
    await onSubmit(event);
    if (!addingRoll) {
      setShowAddModal(false);
    }
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (!editId) return;
    await onUpdateRoll(editId, {
      label: editDraft.label,
      gramsTotal: editDraft.gramsTotal || null,
      spoolWeightGrams: editDraft.spoolWeightGrams || null,
      weightCurrentGrams: editDraft.weightCurrentGrams || null,
      purchasePrice: editDraft.purchasePrice || null,
      purchasedAt: editDraft.purchasedAt || null,
      openedAt: editDraft.openedAt || null,
      lastDriedAt: editDraft.lastDriedAt || null,
      needsDrying: editDraft.needsDrying,
    });
    setShowEditModal(false);
  };

  const openHistory = async (roll) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    setHistoryRoll(roll);
    try {
      const data = await fetchRollUsage(roll.id);
      setHistoryRows(data.usage || []);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedRolls = useMemo(() => {
    const sorted = [...rolls];
    const { key, direction } = sortConfig;
    sorted.sort((a, b) => {
      const dir = direction === "asc" ? 1 : -1;
      const valA = a[key];
      const valB = b[key];
      if (valA === null || valA === undefined) return 1 * dir;
      if (valB === null || valB === undefined) return -1 * dir;
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });
    return sorted;
  }, [rolls, sortConfig]);

  const renderSortLabel = (label, key) => {
    const isActive = sortConfig.key === key;
    const arrow = isActive ? (sortConfig.direction === "asc" ? "▲" : "▼") : "";
    return (
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${
          isActive ? "text-ink dark:text-haze" : "text-slate-400"
        }`}
        onClick={() => handleSort(key)}
      >
        {label}
        <span className="text-[10px]">{arrow}</span>
      </button>
    );
  };

  const getFillClass = (remaining) => {
    if (remaining <= 50) return "bg-rose-500";
    if (remaining <= 150) return "bg-amber-400";
    return "bg-emerald-400";
  };

  const formatPricePerGram = (roll) => {
    if (!roll.purchase_price || !roll.grams_total) return "—";
    return (roll.purchase_price / roll.grams_total).toFixed(4);
  };

  const renderModal = (title, onClose, onSubmitForm, content, modalKey) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
      <div
        className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900"
        data-roll-modal={modalKey}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink dark:text-haze">
            {title}
          </h3>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
            onClick={onClose}
          >
            Schliessen
          </button>
        </div>
        <form className="mt-5 grid gap-4" onSubmit={onSubmitForm}>
          {content}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              disabled={addingRoll}
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <div className="text-sm font-semibold text-ink dark:text-haze">
            Filamentrollen
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Rollen verwalten, Gewicht erfassen und Verbrauch automatisch abziehen.
          </div>
        </div>
        <button
          type="button"
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-accentDeep"
          onClick={openAddModal}
        >
          Rolle hinzufuegen
        </button>
      </div>

      {focusedRoll && (
        <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-ink dark:text-haze">
              Schnell-Update fuer Rolle #{focusedRoll.id}
            </div>
            {rollLinkBase && (
              <a
                className="text-xs text-accent hover:underline"
                href={buildRollLink(focusedRoll.id)}
                target="_blank"
                rel="noreferrer"
              >
                QR-Link oeffnen
              </a>
            )}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Label
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="text"
                name="label"
                value={quickDraft.label}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Spulengewicht (g)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="number"
                name="spoolWeightGrams"
                min="0"
                value={quickDraft.spoolWeightGrams}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Aktuelles Gewicht (g)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="number"
                name="weightCurrentGrams"
                min="0"
                value={quickDraft.weightCurrentGrams}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Gesamt (g)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="number"
                name="gramsTotal"
                min="1"
                value={quickDraft.gramsTotal}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Rest (g)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="number"
                name="gramsRemaining"
                min="0"
                value={quickDraft.gramsRemaining}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Preis
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="number"
                step="0.01"
                min="0"
                name="purchasePrice"
                value={quickDraft.purchasePrice}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Kaufdatum
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="date"
                name="purchasedAt"
                value={quickDraft.purchasedAt}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Oeffnungsdatum
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="date"
                name="openedAt"
                value={quickDraft.openedAt}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Zuletzt getrocknet am
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="date"
                name="lastDriedAt"
                value={quickDraft.lastDriedAt}
                onChange={handleQuickChange}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                name="needsDrying"
                checked={quickDraft.needsDrying}
                onChange={(event) =>
                  setQuickDraft((prev) => ({
                    ...prev,
                    needsDrying: event.target.checked,
                  }))
                }
              />
              Muss getrocknet werden
            </label>
          </div>
          <button
            className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
            type="button"
            onClick={submitQuickUpdate}
          >
            Rolle aktualisieren
          </button>
        </div>
      )}

      {rolls.length === 0 ? (
        <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
          Noch keine Rollen angelegt.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              <tr>
                <th className="px-4 py-3">{renderSortLabel("Farbe", "color_name")}</th>
                <th className="px-4 py-3">{renderSortLabel("Material", "material_type")}</th>
                <th className="px-4 py-3">{renderSortLabel("Label", "label")}</th>
                <th className="px-4 py-3">{renderSortLabel("Rest (g)", "grams_remaining")}</th>
                <th className="px-4 py-3">{renderSortLabel("Gesamt (g)", "grams_total")}</th>
                <th className="px-4 py-3">Preis/g</th>
                <th className="px-4 py-3">{renderSortLabel("Preis", "purchase_price")}</th>
                <th className="px-4 py-3">{renderSortLabel("Kauf", "purchased_at")}</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedRolls.map((roll) => {
                const percentage = roll.grams_total
                  ? Math.round((roll.grams_remaining / roll.grams_total) * 100)
                  : 0;
                const rollLink = buildRollLink(roll.id);
                return (
                  <tr
                    key={roll.id}
                    className={
                      focusRollId === roll.id
                        ? "bg-emerald-50/70 dark:bg-emerald-500/10"
                        : ""
                    }
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-slate-200"
                          style={{
                            backgroundColor: roll.hex_color || "#CBD5F5",
                          }}
                          title={roll.hex_color || "Keine Farbe"}
                        />
                        <span className="font-medium text-ink dark:text-haze">
                          {roll.color_name}
                        </span>
                        {roll.color_manufacturer && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({roll.color_manufacturer})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {roll.material_type || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {roll.label || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">
                          {roll.grams_remaining} g
                        </span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full ${getFillClass(roll.grams_remaining)}`}
                            style={{
                              width: `${Math.max(0, Math.min(100, percentage))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{roll.grams_total} g</td>
                    <td className="px-4 py-4">{formatPricePerGram(roll)}</td>
                    <td className="px-4 py-4">
                      {roll.purchase_price !== null ? roll.purchase_price : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {roll.purchased_at || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {rollLink && (
                          <a
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
                            href={rollLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            QR-Link
                          </a>
                        )}
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
                          onClick={() => openHistory(roll)}
                        >
                          Historie
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
                          onClick={() => openEditModal(roll)}
                        >
                          Bearbeiten
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal &&
        renderModal(
          "Neue Rolle anlegen",
          closeAddModal,
          handleSubmitAdd,
          <>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Farbe
              <select
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                name="colorId"
                value={newRoll.colorId}
                onChange={onNewRollChange}
                required
              >
                <option value="">Bitte waehlen</option>
                {colors.map((color) => (
                  <option key={color.id} value={String(color.id)}>
                    {color.name}
                    {color.manufacturer ? ` (${color.manufacturer})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Label (optional)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="text"
                name="label"
                value={newRoll.label}
                onChange={onNewRollChange}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Gesamtgewicht Filament (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="gramsTotal"
                  min="1"
                  value={newRoll.gramsTotal}
                  onChange={onNewRollChange}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Spulengewicht (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="spoolWeightGrams"
                  min="0"
                  value={newRoll.spoolWeightGrams}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Aktuelles Gewicht inkl. Spule (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="weightCurrentGrams"
                  min="0"
                  value={newRoll.weightCurrentGrams}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Kaufpreis
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchasePrice"
                  value={newRoll.purchasePrice}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Kaufdatum
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="purchasedAt"
                  value={newRoll.purchasedAt}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Oeffnungsdatum
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="openedAt"
                  value={newRoll.openedAt}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Zuletzt getrocknet am
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="lastDriedAt"
                  value={newRoll.lastDriedAt}
                  onChange={onNewRollChange}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  name="needsDrying"
                  checked={newRoll.needsDrying}
                  onChange={(event) =>
                    onNewRollChange({
                      target: {
                        name: "needsDrying",
                        value: event.target.checked,
                      },
                    })
                  }
                />
                Muss getrocknet werden
              </label>
            </div>
          </>,
          "add"
        )}

      {showEditModal &&
        renderModal(
          "Rolle bearbeiten",
          closeEditModal,
          handleSubmitEdit,
          <>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Farbe (aktuell)
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="text"
                value={
                  colors.find((color) => String(color.id) === editDraft.colorId)
                    ?.name || ""
                }
                disabled
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Label
              <input
                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                type="text"
                name="label"
                value={editDraft.label}
                onChange={handleEditChange}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Gesamtgewicht Filament (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="gramsTotal"
                  min="1"
                  value={editDraft.gramsTotal}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Spulengewicht (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="spoolWeightGrams"
                  min="0"
                  value={editDraft.spoolWeightGrams}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Aktuelles Gewicht inkl. Spule (g)
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  name="weightCurrentGrams"
                  min="0"
                  value={editDraft.weightCurrentGrams}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Kaufpreis
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchasePrice"
                  value={editDraft.purchasePrice}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Kaufdatum
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="purchasedAt"
                  value={editDraft.purchasedAt}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Oeffnungsdatum
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="openedAt"
                  value={editDraft.openedAt}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Zuletzt getrocknet am
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
                  type="date"
                  name="lastDriedAt"
                  value={editDraft.lastDriedAt}
                  onChange={handleEditChange}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  name="needsDrying"
                  checked={editDraft.needsDrying}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      needsDrying: event.target.checked,
                    }))
                  }
                />
                Muss getrocknet werden
              </label>
            </div>
          </>,
          "edit"
        )}

      {showHistoryModal && historyRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-haze">
                Historie Rolle #{historyRoll.id}
              </h3>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setShowHistoryModal(false)}
              >
                Schliessen
              </button>
            </div>
            <div className="mt-4">
              {historyLoading ? (
                <div className="text-sm text-slate-500">Lade Historie...</div>
              ) : historyRows.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Noch keine Nutzung gespeichert.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Projekt</th>
                        <th className="px-4 py-3">Gramm</th>
                        <th className="px-4 py-3">Datum</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {historyRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3">
                            <a
                              className="text-ink underline-offset-4 hover:underline dark:text-haze"
                              href={row.project_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.project_url}
                            </a>
                          </td>
                          <td className="px-4 py-3">{row.grams_used} g</td>
                          <td className="px-4 py-3">{row.created_at}</td>
                          <td className="px-4 py-3">{row.project_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
