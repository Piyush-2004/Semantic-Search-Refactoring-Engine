import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";

function getChromaClient() {
  const rawUrl = process.env.CHROMA_URL;
  console.log("🛠️ [DEBUG] Raw process.env.CHROMA_URL:", rawUrl);

  let urlStr = rawUrl || "http://localhost:8000";
  console.log("🛠️ [DEBUG] Fallback URL being used:", urlStr);
  
  // Auto-fix missing protocol
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
    console.log("🛠️ [DEBUG] Auto-added protocol, new URL:", urlStr);
  }

  const parsed = new URL(urlStr);
  const isHttps = parsed.protocol === "https:";
  
  // If it's localhost or an explicit port is provided, path works fine
  if (parsed.hostname === "localhost" || parsed.port !== "") {
    console.log("🛠️ [DEBUG] Using default path connection to:", urlStr);
    return new ChromaClient({ path: urlStr });
  }

  console.log("🛠️ [DEBUG] Using explicit host/port connection to host:", parsed.hostname);
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
