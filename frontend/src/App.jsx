import { useEffect, useMemo, useState } from "react";
import {
  createColor,
  createProject,
  deleteProject,
  fetchColors,
  fetchProjects,
  updateColor,
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
import Header from "./components/Header";
import ManufacturerDatalist from "./components/ManufacturerDatalist";
import ProjectForm from "./components/ProjectForm";
import ProjectsTable from "./components/ProjectsTable";

const manufacturerOptionsId = "manufacturer-options";

export default function App() {
  const [formData, setFormData] = useState({
    url: "",
    quantity: 1,
    notes: "",
    urgency: "Mittel",
    colorId: "",
    colorName: "",
    colorManufacturer: "",
  });
  const [projects, setProjects] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  const [addingColor, setAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorManufacturer, setNewColorManufacturer] = useState("");

  const projectCount = useMemo(() => projects.length, [projects]);
  const availableColors = useMemo(
    () => colors.filter((color) => color.in_stock),
    [colors]
  );
  const manufacturers = useMemo(() => {
    const list = colors
      .map((color) => (color.manufacturer || "").trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [colors]);

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

  useEffect(() => {
    loadProjects();
  }, [showArchived]);

  useEffect(() => {
    loadColors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleColorIdChange = (event) => {
    handleChange(event);
    if (event.target.value !== "new") {
      setFormData((prev) => ({
        ...prev,
        colorName: "",
        colorManufacturer: "",
      }));
    }
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
      };

      if (formData.colorId === "new") {
        const trimmedName = formData.colorName.trim();
        const trimmedManufacturer = formData.colorManufacturer.trim();
        if (!trimmedName) {
          setError("Bitte eine neue Farbe angeben.");
          setSubmitting(false);
          return;
        }
        payload.colorName = trimmedName;
        if (trimmedManufacturer) {
          payload.colorManufacturer = trimmedManufacturer;
        }
      } else if (formData.colorId) {
        payload.colorId = Number(formData.colorId);
      }

      await createProject(payload);

      setFormData({
        url: "",
        quantity: 1,
        notes: "",
        urgency: "Mittel",
        colorId: "",
        colorName: "",
        colorManufacturer: "",
      });
      await loadProjects();
      await loadColors();
    } catch (err) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
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
    const ok = confirm("Projekt wirklich lÃ¶schen?");
    if (!ok) return;
    setError("");
    try {
      await deleteProject(id);
      await loadProjects();
    } catch (err) {
      setError(err.message || "LÃ¶schen fehlgeschlagen.");
    }
  };

  const addColor = async (event) => {
    event.preventDefault();
    const trimmedName = newColorName.trim();
    const trimmedManufacturer = newColorManufacturer.trim();
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
        in_stock: true,
      });
      setNewColorName("");
      setNewColorManufacturer("");
      await loadColors();
    } catch (err) {
      setError(err.message || "Farbe konnte nicht gespeichert werden.");
    } finally {
      setAddingColor(false);
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

  return (
    <div className="min-h-screen app-shell text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <Header projectCount={projectCount} />

        <ErrorBanner error={error} />

        <section className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
          <ProjectForm
            formData={formData}
            onChange={handleChange}
            onColorIdChange={handleColorIdChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            availableColors={availableColors}
            urgencyOptions={urgencyOptions}
            manufacturerOptionsId={manufacturerOptionsId}
          />

          <div>
            <ProjectsTable
              projects={projects}
              loading={loading}
              showArchived={showArchived}
              onToggleArchived={(event) => setShowArchived(event.target.checked)}
              onUpdateStatus={updateStatus}
              onArchive={archiveProject}
              onDelete={handleDeleteProject}
              statusOptions={statusOptions}
              statusStyles={statusStyles}
              urgencyStyles={urgencyStyles}
            />

            <ColorsPanel
              colors={colors}
              addingColor={addingColor}
              newColorName={newColorName}
              newColorManufacturer={newColorManufacturer}
              onNewColorNameChange={(event) => setNewColorName(event.target.value)}
              onNewColorManufacturerChange={(event) =>
                setNewColorManufacturer(event.target.value)
              }
              onSubmit={addColor}
              onToggleStock={toggleColorStock}
              manufacturerOptionsId={manufacturerOptionsId}
            />
          </div>
        </section>
      </div>
      <ManufacturerDatalist
        id={manufacturerOptionsId}
        manufacturers={manufacturers}
      />
    </div>
  );
}
