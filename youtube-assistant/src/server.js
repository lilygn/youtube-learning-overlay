import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { executor } from "./graph.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const input = req.body.message;
  const result = await executor.invoke({ message: input });
  res.json({reply: result });
});

app.listen(5000, () => console.log("LangGraph running on port 5000"));
