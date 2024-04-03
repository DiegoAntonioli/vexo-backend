import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ OK: "OK" });
});

export { router };
export default { router };
