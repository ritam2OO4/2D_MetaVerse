import { Router } from "express";
import {userRouter} from "./user"
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";

export const router = Router();

router.post("/signup", (req, res) => {
  res.json({ message: "signup" });
});

router.post("/signin", (req, res) => {
  res.json({ message: "signin" });
});
router.get("/elements", (req, res) => {
  res.json({ message: "signin" });
});
router.get("/avatars", (req, res) => {
  res.json({ message: "signin" });
});



router.use("/api/v1", userRouter);
router.use("/api/v1", spaceRouter);
router.use("/api/v1", adminRouter);