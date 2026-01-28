export default function ProjectForm({
  formData,
  onChange,
  onColorIdChange,
  onSubmit,
  submitting,
  availableColors,
  urgencyOptions,
  manufacturerOptionsId,
}) {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold">Neues Projekt anlegen</h2>
      <p className="mt-1 text-sm text-slate-500">
        Schicke deiner Freundin ein kompaktes Formular für neue Druckideen.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Modell-URL
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
            name="url"
            type="url"
            placeholder="https://www.printables.com/"
            value={formData.url}
            onChange={onChange}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Gewünschte Anzahl
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={onChange}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Notizen / Ergänzungen
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
            name="notes"
            placeholder="Material, Farbe, Skalierung ..."
            value={formData.notes}
            onChange={onChange}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Dringlichkeit
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
            name="urgency"
            value={formData.urgency}
            onChange={onChange}
          >
            {urgencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Filamentfarbe
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
            name="colorId"
            value={formData.colorId}
            onChange={onColorIdChange}
          >
            <option value="">Keine Auswahl</option>
            {availableColors.map((color) => (
              <option key={color.id} value={String(color.id)}>
                {color.name}
                {color.manufacturer ? ` (${color.manufacturer})` : ""}
              </option>
            ))}
            <option value="new">Andere / nicht vorhanden</option>
          </select>
        </label>
        {formData.colorId === "new" && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Neue Farbe
              <input
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-amber-400"
                name="colorName"
                type="text"
                placeholder="z.B. Pastell Blau"
                value={formData.colorName}
                onChange={onChange}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Hersteller (optional)
              <input
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-amber-400"
                name="colorManufacturer"
                type="text"
                placeholder="z.B. Prusament"
                list={manufacturerOptionsId}
                value={formData.colorManufacturer}
                onChange={onChange}
              />
              <span className="text-xs text-amber-600">
                Hinweis: Diese Farbe wird als nicht vorhanden markiert.
              </span>
            </label>
          </div>
        )}
        <button
          className="mt-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accentDeep disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Speichern..." : "Projekt speichern"}
        </button>
      </form>
    </div>
  );
}
