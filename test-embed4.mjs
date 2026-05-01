import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
    });
    console.log("Embedding single document...");
    const res = await embeddings.embedQuery("Hello world");
    console.log("Result length:", res.length);
  } catch (err) {
    console.error("Error from embedQuery:", err);
  }
}

run();
