import express from "express";

const PORT = 8080;

const app = express();

app.use(express.static("."));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});