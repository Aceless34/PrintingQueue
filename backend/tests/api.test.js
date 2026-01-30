const fs = require("fs");
const os = require("os");
const path = require("path");

let request;
let closeDb;
let tempDir;

const setupApp = async () => {
  jest.resetModules();
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "printingqueue-test-"));
  process.env.DB_DIR = tempDir;
  delete process.env.DB_PATH;
  delete process.env.MQTT_URL;
  process.env.NODE_ENV = "test";

  const { createApp, init } = require("../server");
  const db = require("../db");
  closeDb = db.close;

  await init();
  const { app } = createApp();
  request = require("supertest")(app);
};

afterEach(async () => {
  if (closeDb) {
    await closeDb();
  }
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("Printing Queue API", () => {
  test("GET /health", async () => {
    await setupApp();
    const res = await request.get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test("GET /projects returns empty array by default", async () => {
    await setupApp();
    const res = await request.get("/projects");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("POST /projects validates url, quantity, urgency", async () => {
    await setupApp();

    const resMissingUrl = await request
      .post("/projects")
      .send({ quantity: 1, urgency: "Mittel" });
    expect(resMissingUrl.status).toBe(400);

    const resBadQty = await request
      .post("/projects")
      .send({ url: "https://example.com", quantity: 0, urgency: "Mittel" });
    expect(resBadQty.status).toBe(400);

    const resBadUrgency = await request
      .post("/projects")
      .send({ url: "https://example.com", quantity: 1, urgency: "Jetzt" });
    expect(resBadUrgency.status).toBe(400);
  });

  test("POST /projects supports colorName creation (in_stock=0)", async () => {
    await setupApp();

    const res = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 2,
      urgency: "Hoch",
      colorName: "Pastell Blau",
    });

    expect(res.status).toBe(201);
    expect(res.body.color_name).toBe("Pastell Blau");
    expect(res.body.colors).toHaveLength(1);
    expect(res.body.colors[0].in_stock).toBe(0);

    const colors = await request.get("/filament-colors");
    expect(colors.status).toBe(200);
    expect(colors.body).toHaveLength(1);
    expect(colors.body[0].name).toBe("Pastell Blau");
  });

  test("POST /projects rejects unknown colorId", async () => {
    await setupApp();

    const res = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
      colorId: 999,
    });

    expect(res.status).toBe(400);
  });

  test("POST /projects accepts existing colorId", async () => {
    await setupApp();

    const color = await request
      .post("/filament-colors")
      .send({ name: "Schwarz", in_stock: true });
    expect([200, 201]).toContain(color.status);

    const res = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
      colorId: color.body.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.color_name).toBe("Schwarz");
    expect(res.body.colors).toHaveLength(1);
  });

  test("POST /projects supports multiple colors", async () => {
    await setupApp();

    const first = await request
      .post("/filament-colors")
      .send({ name: "Rot", in_stock: true });
    const second = await request
      .post("/filament-colors")
      .send({ name: "Weiss", in_stock: true });

    const res = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
      colorIds: [first.body.id, second.body.id],
    });

    expect(res.status).toBe(201);
    expect(res.body.colors).toHaveLength(2);
  });

  test("POST /projects treats SQL injection payloads as data", async () => {
    await setupApp();

    const normal = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
    });
    expect(normal.status).toBe(201);

    const payload = "https://example.com/' OR 1=1; --";
    const injected = await request.post("/projects").send({
      url: payload,
      quantity: 1,
      urgency: "Mittel",
      notes: "test'); DROP TABLE projects; --",
    });
    expect(injected.status).toBe(201);
    expect(injected.body.url).toBe(payload);

    const list = await request.get("/projects");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(2);
  });

  test("PATCH /projects requires consumptions when marking as finished", async () => {
    await setupApp();

    const created = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
    });

    const updated = await request
      .patch(`/projects/${created.body.id}`)
      .send({ status: "Fertig" });
    expect(updated.status).toBe(400);
  });

  test("PATCH /projects updates status and archive", async () => {
    await setupApp();

    const created = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
    });

    const updated = await request
      .patch(`/projects/${created.body.id}`)
      .send({ status: "In Arbeit" });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe("In Arbeit");

    const archived = await request
      .patch(`/projects/${created.body.id}`)
      .send({ archived: true });
    expect(archived.status).toBe(200);
    expect(archived.body.archived).toBe(1);

    const resDefault = await request.get("/projects");
    expect(resDefault.body).toHaveLength(0);

    const resArchived = await request.get("/projects?includeArchived=1");
    expect(resArchived.body).toHaveLength(1);
  });

  test("PATCH /projects validates id and status", async () => {
    await setupApp();

    const resBadId = await request.patch("/projects/abc").send({ status: "Offen" });
    expect(resBadId.status).toBe(400);

    const created = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
    });

    const resBadStatus = await request
      .patch(`/projects/${created.body.id}`)
      .send({ status: "Jetzt" });
    expect(resBadStatus.status).toBe(400);
  });

  test("PATCH /projects consumes filament rolls", async () => {
    await setupApp();

    const color = await request
      .post("/filament-colors")
      .send({ name: "Grau", in_stock: true });

    const roll = await request.post("/filament-rolls").send({
      colorId: color.body.id,
      gramsTotal: 1000,
    });

    const project = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
      colorId: color.body.id,
    });

    const updated = await request
      .patch(`/projects/${project.body.id}`)
      .send({
        status: "Fertig",
        consumptions: [{ rollId: roll.body.id, grams: 120 }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.total_grams_used).toBe(120);

    const rolls = await request.get("/filament-rolls");
    expect(rolls.status).toBe(200);
    expect(rolls.body[0].grams_remaining).toBe(880);
  });

  test("PATCH /filament-rolls rejects invalid remaining/weight updates", async () => {
    await setupApp();

    const color = await request
      .post("/filament-colors")
      .send({ name: "Orange", in_stock: true });

    const roll = await request.post("/filament-rolls").send({
      colorId: color.body.id,
      gramsTotal: 500,
      gramsRemaining: 400,
    });
    expect(roll.status).toBe(201);

    const resTooLowTotal = await request
      .patch(`/filament-rolls/${roll.body.id}`)
      .send({ gramsTotal: 300 });
    expect(resTooLowTotal.status).toBe(400);

    const resBadWeight = await request
      .patch(`/filament-rolls/${roll.body.id}`)
      .send({ spoolWeightGrams: 200, weightCurrentGrams: 150 });
    expect(resBadWeight.status).toBe(400);

    const unchanged = await request.get(`/filament-rolls/${roll.body.id}`);
    expect(unchanged.status).toBe(200);
    expect(unchanged.body.grams_total).toBe(500);
    expect(unchanged.body.grams_remaining).toBe(400);
  });

  test("DELETE /projects validates id and removes item", async () => {
    await setupApp();

    const resBadId = await request.delete("/projects/abc");
    expect(resBadId.status).toBe(400);

    const resNotFound = await request.delete("/projects/999");
    expect(resNotFound.status).toBe(404);

    const created = await request.post("/projects").send({
      url: "https://example.com/model",
      quantity: 1,
      urgency: "Mittel",
    });

    const resDelete = await request.delete(`/projects/${created.body.id}`);
    expect(resDelete.status).toBe(204);

    const list = await request.get("/projects");
    expect(list.body).toHaveLength(0);
  });

  test("GET /filament-colors returns empty initially", async () => {
    await setupApp();
    const res = await request.get("/filament-colors");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("POST /filament-colors validates name and deduplicates", async () => {
    await setupApp();

    const resMissing = await request.post("/filament-colors").send({});
    expect(resMissing.status).toBe(400);

    const first = await request
      .post("/filament-colors")
      .send({ name: "Schwarz", in_stock: true });
    expect([200, 201]).toContain(first.status);

    const second = await request
      .post("/filament-colors")
      .send({ name: "schwarz", in_stock: false });
    expect(second.status).toBe(200);
    expect(second.body.id).toBe(first.body.id);
  });

  test("POST /filament-colors treats SQL injection payloads as data", async () => {
    await setupApp();

    const payload = "Weiss'); DROP TABLE filament_colors; --";
    const injected = await request
      .post("/filament-colors")
      .send({ name: payload, in_stock: true });
    expect([200, 201]).toContain(injected.status);
    expect(injected.body.name).toBe(payload);

    const second = await request
      .post("/filament-colors")
      .send({ name: "Grau", in_stock: false });
    expect([200, 201]).toContain(second.status);

    const list = await request.get("/filament-colors");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(2);
  });

  test("PATCH /filament-colors validates id, body and updates stock", async () => {
    await setupApp();

    const resBadId = await request
      .patch("/filament-colors/abc")
      .send({ in_stock: true });
    expect(resBadId.status).toBe(400);

    const resNoFields = await request.patch("/filament-colors/1").send({});
    expect(resNoFields.status).toBe(400);

    const resNotFound = await request
      .patch("/filament-colors/1")
      .send({ in_stock: false });
    expect(resNotFound.status).toBe(404);

    const color = await request
      .post("/filament-colors")
      .send({ name: "Weiss", in_stock: true });

    const updated = await request
      .patch(`/filament-colors/${color.body.id}`)
      .send({ in_stock: false });
    expect(updated.status).toBe(200);
    expect(updated.body.in_stock).toBe(0);
  });

  test("DELETE /filament-colors removes unused colors and rejects in-use", async () => {
    await setupApp();

    const color = await request
      .post("/filament-colors")
      .send({ name: "Kupfer", in_stock: true });
    const resDelete = await request.delete(`/filament-colors/${color.body.id}`);
    expect(resDelete.status).toBe(204);

    const usedColor = await request
      .post("/filament-colors")
      .send({ name: "Cyan", in_stock: true });
    const roll = await request.post("/filament-rolls").send({
      colorId: usedColor.body.id,
      gramsTotal: 1000,
    });
    expect(roll.status).toBe(201);

    const resInUse = await request.delete(
      `/filament-colors/${usedColor.body.id}`
    );
    expect(resInUse.status).toBe(400);
  });

  test("POST /filament-rolls validates color and grams", async () => {
    await setupApp();

    const color = await request
      .post("/filament-colors")
      .send({ name: "Blau", in_stock: true });

    const resBad = await request.post("/filament-rolls").send({
      colorId: color.body.id,
      gramsTotal: -5,
    });
    expect(resBad.status).toBe(400);

    const created = await request.post("/filament-rolls").send({
      colorId: color.body.id,
      gramsTotal: 750,
      label: "Rolle #2",
    });
    expect(created.status).toBe(201);
    expect(created.body.grams_remaining).toBe(750);
  });

  test("POST /filament-manufacturers and /filament-materials create entries", async () => {
    await setupApp();

    const manufacturer = await request
      .post("/filament-manufacturers")
      .send({ name: "Prusament" });
    expect(manufacturer.status).toBe(201);

    const material = await request
      .post("/filament-materials")
      .send({ name: "PLA" });
    expect(material.status).toBe(201);

    const listManufacturers = await request.get("/filament-manufacturers");
    expect(listManufacturers.status).toBe(200);
    expect(listManufacturers.body[0].name).toBe("Prusament");

    const listMaterials = await request.get("/filament-materials");
    expect(listMaterials.status).toBe(200);
    expect(listMaterials.body[0].name).toBe("PLA");
  });

  test("PATCH/DELETE /filament-manufacturers and /filament-materials", async () => {
    await setupApp();

    const manufacturer = await request
      .post("/filament-manufacturers")
      .send({ name: "Bambu" });
    const updatedManufacturer = await request
      .patch(`/filament-manufacturers/${manufacturer.body.id}`)
      .send({ name: "Bambu Lab" });
    expect(updatedManufacturer.status).toBe(200);
    expect(updatedManufacturer.body.name).toBe("Bambu Lab");

    const material = await request
      .post("/filament-materials")
      .send({ name: "ABS" });
    const updatedMaterial = await request
      .patch(`/filament-materials/${material.body.id}`)
      .send({ name: "ASA" });
    expect(updatedMaterial.status).toBe(200);
    expect(updatedMaterial.body.name).toBe("ASA");

    const deleteManufacturer = await request.delete(
      `/filament-manufacturers/${manufacturer.body.id}`
    );
    expect(deleteManufacturer.status).toBe(204);

    const deleteMaterial = await request.delete(
      `/filament-materials/${material.body.id}`
    );
    expect(deleteMaterial.status).toBe(204);
  });

  test("PATCH /filament-manufacturers and /filament-materials keeps colors in sync", async () => {
    await setupApp();

    const manufacturer = await request
      .post("/filament-manufacturers")
      .send({ name: "MakerCo" });
    const material = await request
      .post("/filament-materials")
      .send({ name: "PETG" });

    const color = await request.post("/filament-colors").send({
      name: "Cyan",
      manufacturer: manufacturer.body.name,
      material_type: material.body.name,
      in_stock: true,
    });
    expect(color.status).toBe(201);

    const updatedManufacturer = await request
      .patch(`/filament-manufacturers/${manufacturer.body.id}`)
      .send({ name: "MakerCo Pro" });
    expect(updatedManufacturer.status).toBe(200);

    const updatedMaterial = await request
      .patch(`/filament-materials/${material.body.id}`)
      .send({ name: "PETG+" });
    expect(updatedMaterial.status).toBe(200);

    const colors = await request.get("/filament-colors");
    const updatedColor = colors.body.find((item) => item.id === color.body.id);
    expect(updatedColor.manufacturer).toBe("MakerCo Pro");
    expect(updatedColor.material_type).toBe("PETG+");
  });
});
