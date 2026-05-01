import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2",
    });
    const url = "https://chroma-production-21b7.up.railway.app";
    console.log("Connecting to", url);
    
    // Test collection creation
    const vectorStore = new Chroma(embeddings, {
      collectionName: "test-collection",
      url: url,
    });
    
    await vectorStore.ensureCollection();
    console.log("Connection successful!");
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

run();
