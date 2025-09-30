import express from "express";
import router from "./router.js";

const app = express();
app.use(express.json());
app.use("/api/escrow/", router);


app.listen(3000, () => console.log("API running on port 3000"));    