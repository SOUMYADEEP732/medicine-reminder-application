import dotenv from "dotenv"
import app from "./app.js";
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 5173;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0",() => console.log(`Server running on http://localhost:${PORT}`));
});