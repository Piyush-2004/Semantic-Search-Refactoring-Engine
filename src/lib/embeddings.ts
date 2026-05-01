import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";

function getChromaClient() {
  let urlStr = process.env.CHROMA_URL || "http://localhost:8000";
  
  // Auto-fix missing protocol
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }

  const parsed = new URL(urlStr);
  const isHttps = parsed.protocol === "https:";
  
  // If it's localhost or an explicit port is provided, path works fine
  if (parsed.hostname === "localhost" || parsed.port !== "") {
    return new ChromaClient({ path: urlStr });
  }

  // Workaround for chromadb bug: explicitly pass empty port when no port is provided
  return new ChromaClient({ 
    host: parsed.hostname, 
    port: "" as any, 
    ssl: isHttps 
  });
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
