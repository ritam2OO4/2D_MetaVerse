import express from "express";
import { router } from "./routes/v1/index";

const app = express();
app.use("/api/v1", router);

app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Test route works");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
