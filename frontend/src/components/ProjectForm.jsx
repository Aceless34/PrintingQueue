export default function ProjectForm({
  formData,
  onChange,
  onToggleColor,
  onSubmit,
  submitting,
  availableColors,
  rolls,
  urgencyOptions,
  manufacturerOptionsId,
}) {
  const selectedColorIds = formData.colorIds || [];
  const matchingRolls = rolls.filter((roll) =>
    selectedColorIds.includes(roll.color_id)
  );
  const pricePerGramValues = matchingRolls
    .filter((roll) => roll.purchase_price && roll.grams_total)
    .map((roll) => roll.purchase_price / roll.grams_total);
  const averagePricePerGram =
    pricePerGramValues.length > 0
      ? pricePerGramValues.reduce((sum, value) => sum + value, 0) /
        pricePerGramValues.length
      : null;

  return (
    <div className="glass-card rounded-3xl p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold text-ink dark:text-haze">
        Neues Projekt anlegen
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Schicke deiner Freundin ein kompaktes Formular fuer neue Druckideen.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          Modell-URL
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
            name="url"
            type="url"
            placeholder="https://www.printables.com/"
            value={formData.url}
            onChange={onChange}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          Gewuenschte Anzahl
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={onChange}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          Notizen / Ergaenzungen
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
            name="notes"
            placeholder="Material, Farbe, Skalierung ..."
            value={formData.notes}
            onChange={onChange}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          Dringlichkeit
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Filamentfarben</span>
            <span className="text-xs text-slate-400">Mehrere Farben moeglich</span>
          </div>
          <div className="max-h-40 overflow-auto rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {availableColors.length === 0 ? (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Noch keine Farben angelegt.
              </div>
            ) : (
              <div className="grid gap-2">
                {availableColors.map((color) => (
                  <label
                    key={color.id}
                    className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent dark:border-slate-600 dark:bg-slate-900"
                        checked={formData.colorIds.includes(color.id)}
                        onChange={() => onToggleColor(color.id)}
                      />
                      <span className="font-medium text-ink dark:text-haze">
                        {color.name}
                      </span>
                      {color.manufacturer ? (
                        <span className="text-xs text-slate-400">
                          ({color.manufacturer})
                        </span>
                      ) : null}
                    </span>
                    {!color.in_stock && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        fehlt
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
          {averagePricePerGram !== null && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Durchschnittlicher Preis pro g (basierend auf Rollen):{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {averagePricePerGram.toFixed(4)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Neue Farbe (optional)
            <input
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-haze"
              name="newColorName"
              type="text"
              placeholder="z.B. Pastell Blau"
              value={formData.newColorName}
              onChange={onChange}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Hersteller (optional)
            <input
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-haze"
              name="newColorManufacturer"
              type="text"
              placeholder="z.B. Prusament"
              list={manufacturerOptionsId}
              value={formData.newColorManufacturer}
              onChange={onChange}
            />
            <span className="text-xs text-amber-600 dark:text-amber-300">
              Hinweis: Neue Farben werden als nicht vorhanden markiert.
            </span>
          </label>
        </div>
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
