import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001",
    });
    console.log("Embedding documents with embedding-001...");
    const res = await embeddings.embedDocuments(["Hello world", "Test 2"]);
    console.log("First embedding length:", res[0]?.length);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
