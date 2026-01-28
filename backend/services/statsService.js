const { get } = require("../db");
const { publish } = require("../mqtt");

const publishProjectStats = async () => {
  const openCountRow = await get(
    `SELECT COUNT(*) as count FROM projects WHERE archived = 0 AND status = 'Offen'`
  );
  const latestHighUrgent = await get(
    `SELECT * FROM projects WHERE archived = 0 AND urgency = 'Hoch' AND status IN ('Offen', 'In Arbeit') ORDER BY datetime(created_at) DESC LIMIT 1`
  );

  publish("count_open", { count: openCountRow?.count || 0 });
  publish("latest_high_urgent", latestHighUrgent || {});
};

module.exports = { publishProjectStats };
