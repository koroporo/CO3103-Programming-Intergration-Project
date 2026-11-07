const reportService = require("../../services/Report/reportService");

async function createReport(req, res) {
  const report = await reportService.createReport(
    req.params.id,
    req.body,
    req.user,
  );

  return res.status(201).json({
    message: "Report submitted successfully",
    data: report,
  });
}

async function listReports(req, res) {
  const result = await reportService.listReports(
    req.params.id,
    req.query,
    req.user,
  );

  return res.json(result);
}

module.exports = {
  createReport,
  listReports,
};
