import { Router } from "express";

const v1Routes = Router();

v1Routes.get("/", (_, res) => {
  res.send("V1 API is working");
});

v1Routes.get("/health", (_, res) => {
  res.status(200).json({ status: "V1 API is healthy" });
});

export default v1Routes;
