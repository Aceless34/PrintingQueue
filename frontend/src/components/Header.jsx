export default function Header({ projectCount }) {
  return (
    <header className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
        Printing Queue
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            3D-Druck Projekte im Blick
          </h1>
          <p className="max-w-xl text-sm text-slate-500">
            Sammle alle DruckauftrÃ¤ge, priorisiere sie schnell und halte den
            Status in einem kompakten Dashboard im Blick.
          </p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm shadow-card">
          {projectCount} aktive Projekte
        </div>
      </div>
    </header>
  );
}
