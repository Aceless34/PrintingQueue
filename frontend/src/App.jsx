import { useEffect, useMemo, useState } from "react";
import {
  createColor,
  createManufacturer,
  createMaterial,
  createProject,
  createRoll,
  deleteProject,
  deleteColor,
  deleteManufacturer,
  deleteMaterial,
  fetchColors,
  fetchManufacturers,
  fetchMaterials,
  fetchProjects,
  fetchRolls,
  updateColor,
  updateManufacturer,
  updateMaterial,
  updateRoll,
  updateProject,
} from "./api/client";
import {
  statusOptions,
  statusStyles,
  urgencyOptions,
  urgencyStyles,
} from "./constants/options";
import ColorsPanel from "./components/ColorsPanel";
import ErrorBanner from "./components/ErrorBanner";
import FilamentRollsPanel from "./components/FilamentRollsPanel";
import ManufacturerDatalist from "./components/ManufacturerDatalist";
import PageHeader from "./components/PageHeader";
import ProjectForm from "./components/ProjectForm";
import ProjectsTable from "./components/ProjectsTable";
import SettingsPanel from "./components/SettingsPanel";
import Sidebar from "./components/Sidebar";

const manufacturerOptionsId = "manufacturer-options";

const pageContent = {
  home: {
    title: "Neues Projekt",
    description:
      "Lege hier neue 3D-Druckauftraege an. Verwaltung und Uebersicht findest du im Admin-Dashboard.",
  },
  admin: {
    title: "Admin-Dashboard",
    description:
      "Behalte alle Projekte, Statuswechsel und Archivierung an einem Ort im Blick.",
  },
  filament: {
    title: "Filamentmanagement",
    description:
      "Pflege Farben, Rollen und Verbrauchsdaten zentral in deiner Materialverwaltung.",
  },
  settings: {
    title: "Einstellungen",
    description:
      "Hersteller und Materialien pflegen, damit die Auswahllisten aktuell bleiben.",
  },
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [formData, setFormData] = useState({
    url: "",
    quantity: 1,
    notes: "",
    urgency: "Mittel",
    colorIds: [],
    newColorName: "",
    newColorManufacturer: "",
  });
  const [projects, setProjects] = useState([]);
  const [colors, setColors] = useState([]);
  const [rolls, setRolls] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  const [addingColor, setAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorManufacturer, setNewColorManufacturer] = useState("");
  const [newColorMaterial, setNewColorMaterial] = useState("");
  const [newColorHex, setNewColorHex] = useState("");
  const [addingRoll, setAddingRoll] = useState(false);
  const [newRoll, setNewRoll] = useState({
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
  });
  const [focusRollId, setFocusRollId] = useState(null);
  const [consumptionOpenId, setConsumptionOpenId] = useState(null);
  const [consumptionDrafts, setConsumptionDrafts] = useState({});
  const [pendingStatus, setPendingStatus] = useState({});
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const projectCount = useMemo(() => projects.length, [projects]);
  const availableColors = useMemo(() => colors, [colors]);
  const manufacturerNames = useMemo(
    () => manufacturers.map((item) => item.name),
    [manufacturers]
  );
  const materialNames = useMemo(
    () => materials.map((item) => item.name),
    [materials]
  );

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProjects(showArchived);
      setProjects(data);
    } catch (err) {
      setError(err.message || "Beim Laden ist etwas schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  const loadColors = async () => {
    try {
      const data = await fetchColors();
      setColors(data);
    } catch (err) {
      setError(err.message || "Filamentfarben konnten nicht geladen werden.");
    }
  };

  const loadRolls = async () => {
    try {
      const data = await fetchRolls();
      setRolls(data);
    } catch (err) {
      setError(err.message || "Filamentrollen konnten nicht geladen werden.");
    }
  };

  const loadManufacturers = async () => {
    try {
      const data = await fetchManufacturers();
      setManufacturers(data);
    } catch (err) {
      setError(err.message || "Hersteller konnten nicht geladen werden.");
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (err) {
      setError(err.message || "Materialien konnten nicht geladen werden.");
    }
  };

  useEffect(() => {
    loadProjects();
  }, [showArchived]);

  useEffect(() => {
    loadColors();
    loadRolls();
    loadManufacturers();
    loadMaterials();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rollIdParam = params.get("rollId");
    const parsedId = Number(rollIdParam);
    if (Number.isInteger(parsedId)) {
      setFocusRollId(parsedId);
      setActivePage("filament");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";
    root.classList.remove("dark");
    body.classList.remove("dark");
    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    }
    root.style.colorScheme = isDark ? "dark" : "light";
    body.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleToggleColor = (colorId) => {
    setFormData((prev) => {
      const current = new Set(prev.colorIds.map(String));
      const key = String(colorId);
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      return {
        ...prev,
        colorIds: Array.from(current).map(Number),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        url: formData.url,
        quantity: formData.quantity,
        notes: formData.notes,
        urgency: formData.urgency,
        colorIds: formData.colorIds,
      };

      const trimmedName = formData.newColorName.trim();
      const trimmedManufacturer = formData.newColorManufacturer.trim();
      if (trimmedName) {
        payload.colorName = trimmedName;
        if (trimmedManufacturer) {
          payload.colorManufacturer = trimmedManufacturer;
        }
      }

      await createProject(payload);

      setFormData({
        url: "",
        quantity: 1,
        notes: "",
        urgency: "Mittel",
        colorIds: [],
        newColorName: "",
        newColorManufacturer: "",
      });
      await loadProjects();
      await loadColors();
      await loadRolls();
    } catch (err) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  };

  const ensureConsumptionDraft = (projectId) => {
    setConsumptionDrafts((prev) => {
      if (prev[projectId]) return prev;
      return { ...prev, [projectId]: [{ rollId: "", grams: "" }] };
    });
  };

  const openConsumption = (projectId, status) => {
    setConsumptionOpenId(projectId);
    ensureConsumptionDraft(projectId);
    if (status !== "Fertig") {
      setPendingStatus((prev) => ({ ...prev, [projectId]: "Fertig" }));
    }
  };

  const closeConsumption = (projectId) => {
    setConsumptionOpenId(null);
    setPendingStatus((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  };

  const updateConsumptionEntry = (projectId, index, field, value) => {
    setConsumptionDrafts((prev) => {
      const entries = prev[projectId] ? [...prev[projectId]] : [];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, [projectId]: entries };
    });
  };

  const addConsumptionRow = (projectId) => {
    setConsumptionDrafts((prev) => {
      const entries = prev[projectId] ? [...prev[projectId]] : [];
      entries.push({ rollId: "", grams: "" });
      return { ...prev, [projectId]: entries };
    });
  };

  const removeConsumptionRow = (projectId, index) => {
    setConsumptionDrafts((prev) => {
      const entries = prev[projectId] ? [...prev[projectId]] : [];
      entries.splice(index, 1);
      return {
        ...prev,
        [projectId]: entries.length > 0 ? entries : [{ rollId: "", grams: "" }],
      };
    });
  };

  const submitConsumption = async (projectId) => {
    setError("");
    const entries = (consumptionDrafts[projectId] || [])
      .map((entry) => ({
        rollId: entry.rollId ? Number(entry.rollId) : null,
        grams: entry.grams ? Number(entry.grams) : null,
      }))
      .filter(
        (entry) =>
          Number.isInteger(entry.rollId) &&
          Number.isInteger(entry.grams) &&
          entry.grams > 0
      );

    if (entries.length === 0) {
      setError("Bitte einen Filamentverbrauch angeben.");
      return;
    }

    const payload = {
      consumptions: entries,
    };
    if (pendingStatus[projectId]) {
      payload.status = pendingStatus[projectId];
    }

    try {
      await updateProject(projectId, payload);
      setConsumptionDrafts((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      closeConsumption(projectId);
      await loadProjects();
      await loadRolls();
    } catch (err) {
      setError(err.message || "Verbrauch konnte nicht gebucht werden.");
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    if (status === "Fertig") {
      openConsumption(id, status);
      return;
    }

    try {
      await updateProject(id, { status });
      await loadProjects();
    } catch (err) {
      setError(err.message || "Status konnte nicht aktualisiert werden.");
    }
  };

  const archiveProject = async (id) => {
    setError("");
    try {
      await updateProject(id, { archived: true });
      await loadProjects();
    } catch (err) {
      setError(err.message || "Archivierung fehlgeschlagen.");
    }
  };

  const handleDeleteProject = async (id) => {
    const ok = confirm("Projekt wirklich loeschen?");
    if (!ok) return;
    setError("");
    try {
      await deleteProject(id);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Loeschen fehlgeschlagen.");
    }
  };

  const addColor = async (event) => {
    event.preventDefault();
    const trimmedName = newColorName.trim();
    const trimmedManufacturer = newColorManufacturer.trim();
    const trimmedMaterial = newColorMaterial.trim();
    const trimmedHex = newColorHex.trim();
    if (!trimmedName) {
      setError("Bitte eine Farbe eingeben.");
      return;
    }
    setAddingColor(true);
    setError("");
    try {
      await createColor({
        name: trimmedName,
        manufacturer: trimmedManufacturer || null,
        material_type: trimmedMaterial || null,
        hex_color: trimmedHex || null,
        in_stock: true,
      });
      setNewColorName("");
      setNewColorManufacturer("");
      setNewColorMaterial("");
      setNewColorHex("");
      await loadColors();
    } catch (err) {
      setError(err.message || "Farbe konnte nicht gespeichert werden.");
    } finally {
      setAddingColor(false);
    }
  };

  const handleCreateManufacturer = async (name) => {
    setError("");
    try {
      await createManufacturer({ name });
      await loadManufacturers();
    } catch (err) {
      setError(err.message || "Hersteller konnte nicht gespeichert werden.");
    }
  };

  const handleCreateMaterial = async (name) => {
    setError("");
    try {
      await createMaterial({ name });
      await loadMaterials();
    } catch (err) {
      setError(err.message || "Material konnte nicht gespeichert werden.");
    }
  };

  const handleUpdateManufacturer = async (id, payload) => {
    setError("");
    try {
      await updateManufacturer(id, payload);
      await loadManufacturers();
    } catch (err) {
      setError(err.message || "Hersteller konnte nicht aktualisiert werden.");
    }
  };

  const handleDeleteManufacturer = async (id) => {
    const ok = confirm("Hersteller wirklich loeschen?");
    if (!ok) return;
    setError("");
    try {
      await deleteManufacturer(id);
      await loadManufacturers();
    } catch (err) {
      setError(err.message || "Hersteller konnte nicht geloescht werden.");
    }
  };

  const handleUpdateMaterial = async (id, payload) => {
    setError("");
    try {
      await updateMaterial(id, payload);
      await loadMaterials();
    } catch (err) {
      setError(err.message || "Material konnte nicht aktualisiert werden.");
    }
  };

  const handleDeleteMaterial = async (id) => {
    const ok = confirm("Material wirklich loeschen?");
    if (!ok) return;
    setError("");
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (err) {
      setError(err.message || "Material konnte nicht geloescht werden.");
    }
  };

  const toggleColorStock = async (color) => {
    setError("");
    try {
      await updateColor(color.id, { in_stock: !color.in_stock });
      await loadColors();
    } catch (err) {
      setError(err.message || "Farbe konnte nicht aktualisiert werden.");
    }
  };

  const handleUpdateColor = async (id, payload) => {
    setError("");
    try {
      await updateColor(id, payload);
      await loadColors();
    } catch (err) {
      setError(err.message || "Farbe konnte nicht aktualisiert werden.");
    }
  };

  const handleDeleteColor = async (id) => {
    const ok = confirm("Farbe wirklich loeschen?");
    if (!ok) return;
    setError("");
    try {
      await deleteColor(id);
      await loadColors();
    } catch (err) {
      setError(err.message || "Farbe konnte nicht geloescht werden.");
    }
  };

  const handleNewRollChange = (event) => {
    const { name, value } = event.target;
    setNewRoll((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addRoll = async (event) => {
    event.preventDefault();
    if (!newRoll.colorId) {
      setError("Bitte eine Farbe fuer die Rolle auswaehlen.");
      return;
    }
    if (!newRoll.gramsTotal) {
      setError("Bitte die Grammzahl der Rolle angeben.");
      return;
    }
    setAddingRoll(true);
    setError("");
    try {
      await createRoll({
        colorId: Number(newRoll.colorId),
        label: newRoll.label,
        gramsTotal: Number(newRoll.gramsTotal),
        spoolWeightGrams: newRoll.spoolWeightGrams
          ? Number(newRoll.spoolWeightGrams)
          : null,
        weightCurrentGrams: newRoll.weightCurrentGrams
          ? Number(newRoll.weightCurrentGrams)
          : null,
        purchasePrice: newRoll.purchasePrice ? Number(newRoll.purchasePrice) : null,
        purchasedAt: newRoll.purchasedAt || null,
        openedAt: newRoll.openedAt || null,
        lastDriedAt: newRoll.lastDriedAt || null,
        needsDrying: newRoll.needsDrying,
      });
      setNewRoll({
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
      });
      await loadRolls();
    } catch (err) {
      setError(err.message || "Rolle konnte nicht gespeichert werden.");
    } finally {
      setAddingRoll(false);
    }
  };

  const handleUpdateRoll = async (rollId, payload) => {
    setError("");
    try {
      await updateRoll(rollId, payload);
      await loadRolls();
    } catch (err) {
      setError(err.message || "Rolle konnte nicht aktualisiert werden.");
    }
  };

  const content = pageContent[activePage] || pageContent.home;

  return (
    <div className="min-h-screen app-shell text-ink dark:text-haze">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <Sidebar currentPage={activePage} onChange={setActivePage} />

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <PageHeader
            title={content.title}
            description={content.description}
            projectCount={projectCount}
            theme={theme}
            onToggleTheme={() =>
              setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))
            }
          />

          <ErrorBanner error={error} />

          {activePage === "home" && (
            <section className="max-w-3xl">
              <ProjectForm
                formData={formData}
                onChange={handleChange}
                onToggleColor={handleToggleColor}
                onSubmit={handleSubmit}
                submitting={submitting}
                availableColors={availableColors}
                rolls={rolls}
                urgencyOptions={urgencyOptions}
                manufacturerOptionsId={manufacturerOptionsId}
              />
            </section>
          )}

          {activePage === "admin" && (
            <section>
              <ProjectsTable
                projects={projects}
                loading={loading}
                showArchived={showArchived}
                onToggleArchived={(event) =>
                  setShowArchived(event.target.checked)
                }
                onUpdateStatus={updateStatus}
                onArchive={archiveProject}
                onDelete={handleDeleteProject}
                statusOptions={statusOptions}
                statusStyles={statusStyles}
                urgencyStyles={urgencyStyles}
                rolls={rolls}
                consumptionOpenId={consumptionOpenId}
                consumptionDrafts={consumptionDrafts}
                onOpenConsumption={openConsumption}
                onCloseConsumption={closeConsumption}
                onUpdateConsumptionEntry={updateConsumptionEntry}
                onAddConsumptionRow={addConsumptionRow}
                onRemoveConsumptionRow={removeConsumptionRow}
                onSubmitConsumption={submitConsumption}
              />
            </section>
          )}

          {activePage === "filament" && (
            <section className="flex flex-col gap-6">
              <ColorsPanel
                colors={colors}
                addingColor={addingColor}
                newColorName={newColorName}
                newColorManufacturer={newColorManufacturer}
                newColorMaterial={newColorMaterial}
                newColorHex={newColorHex}
                manufacturerOptions={manufacturerNames}
                materialOptions={materialNames}
                onNewColorNameChange={(event) =>
                  setNewColorName(event.target.value)
                }
                onNewColorManufacturerChange={(event) =>
                  setNewColorManufacturer(event.target.value)
                }
                onNewColorMaterialChange={(event) =>
                  setNewColorMaterial(event.target.value)
                }
                onNewColorHexChange={(event) => setNewColorHex(event.target.value)}
                onSubmit={addColor}
                onToggleStock={toggleColorStock}
                onUpdateColor={handleUpdateColor}
                onDeleteColor={handleDeleteColor}
                manufacturerOptionsId={manufacturerOptionsId}
              />

              <FilamentRollsPanel
                colors={colors}
                rolls={rolls}
                addingRoll={addingRoll}
                newRoll={newRoll}
                onNewRollChange={handleNewRollChange}
                onSubmit={addRoll}
                onUpdateRoll={handleUpdateRoll}
                focusRollId={focusRollId}
                rollLinkBase={
                  typeof window === "undefined"
                    ? ""
                    : `${window.location.origin}${window.location.pathname}`
                }
              />
            </section>
          )}

          {activePage === "settings" && (
            <section>
              <SettingsPanel
                manufacturers={manufacturers}
                materials={materials}
                onAddManufacturer={handleCreateManufacturer}
                onUpdateManufacturer={handleUpdateManufacturer}
                onDeleteManufacturer={handleDeleteManufacturer}
                onAddMaterial={handleCreateMaterial}
                onUpdateMaterial={handleUpdateMaterial}
                onDeleteMaterial={handleDeleteMaterial}
              />
            </section>
          )}
        </div>
      </div>
      <ManufacturerDatalist
        id={manufacturerOptionsId}
        manufacturers={manufacturerNames}
      />
    </div>
  );
}
