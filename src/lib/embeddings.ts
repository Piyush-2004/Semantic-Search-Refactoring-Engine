import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";

// Helper to fix the chromadb URL parsing bug
function getChromaClient() {
  const url = process.env.CHROMA_URL || "http://localhost:8000";
  
  if (url.startsWith("https://")) {
    const host = url.replace("https://", "").split("/")[0];
    // Workaround: passing empty string for port prevents chromadb from appending ":0"
    return new ChromaClient({ host: host, port: "" as any, ssl: true });
  } else {
    // Works fine for http://localhost:8000
    return new ChromaClient({ path: url });
  }
}

export async function storeInChromaDB(docs: Document[], collectionName: string = "codebase-gemini") {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
  });

  const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName: collectionName,
    index: getChromaClient(),
  });

  return vectorStore;
}

export async function getVectorStore(collectionName: string = "codebase-gemini") {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
  });

  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: collectionName,
    index: getChromaClient(),
  });

  return vectorStore;
}
