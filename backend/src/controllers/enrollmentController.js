const enrollmentService = require("../services/enrollmentService");

async function enroll(req, res) {
  const result = await enrollmentService.enroll(req.body, req.user);

  let statusCode = 200;
  let message = "Already enrolled";

  if (result.created) {
    statusCode = 201;
    message = "Enrolled successfully";
  } else if (result.reactivated) {
    message = "Enrollment reactivated successfully";
  }

  res.status(statusCode).json({
    message: message,
    data: result.enrollment
  });
}

async function list(req, res) {
  const result = await enrollmentService.list(req.query, req.user);
  res.json(result);
}

async function getById(req, res) {
  const enrollment = await enrollmentService.getById(req.params.id, req.user);
  res.json({ data: enrollment });
}

async function withdraw(req, res) {
  const enrollment = await enrollmentService.withdraw(req.params.id, req.user);
  res.json({ message: "Enrollment withdrawn successfully", data: enrollment });
}

async function resume(req, res) {
  const enrollment = await enrollmentService.resume(req.params.id, req.body, req.user);
  res.json({ message: "Resume lesson updated successfully", data: enrollment });
}

module.exports = { enroll, list, getById, withdraw, resume };
