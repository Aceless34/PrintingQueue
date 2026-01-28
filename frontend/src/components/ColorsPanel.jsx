export default function ColorsPanel({
  colors,
  addingColor,
  newColorName,
  newColorManufacturer,
  onNewColorNameChange,
  onNewColorManufacturerChange,
  onSubmit,
  onToggleStock,
  manufacturerOptionsId,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-ink">Filamentfarben</div>
          <div className="text-xs text-slate-400">
            Fehlende Farben sind mit einem Ausrufezeichen markiert.
          </div>
        </div>
        <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmit}>
          <input
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-ink outline-none focus:border-accent"
            type="text"
            placeholder="Neue Farbe hinzufuegen"
            value={newColorName}
            onChange={onNewColorNameChange}
          />
          <input
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-ink outline-none focus:border-accent"
            type="text"
            placeholder="Hersteller (optional)"
            list={manufacturerOptionsId}
            value={newColorManufacturer}
            onChange={onNewColorManufacturerChange}
          />
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent disabled:opacity-60"
            type="submit"
            disabled={addingColor}
          >
            {addingColor ? "Speichern..." : "Hinzufuegen"}
          </button>
        </form>
      </div>
      {colors.length === 0 ? (
        <div className="px-4 py-4 text-sm text-slate-500">
          Noch keine Farben gepflegt.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    color.in_stock ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="font-medium text-ink">{color.name}</span>
                {color.manufacturer && (
                  <span className="text-xs text-slate-500">
                    ({color.manufacturer})
                  </span>
                )}
                {!color.in_stock && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    !
                  </span>
                )}
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                onClick={() => onToggleStock(color)}
              >
                {color.in_stock
                  ? "Als fehlend markieren"
                  : "Als vorhanden markieren"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
