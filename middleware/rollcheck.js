
export const doctorOnly = (request, response, next) => {
  if (request.user.role !== "doctor")
    return res.status(403).json({ error: "Only doctors allowed" });
  next();
};

export const patientOnly = (request, response, next) => {
  if (request.user.role !== "patient")
    return res.status(403).json({ error: "Only patients allowed" });
  next();
};