import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";

export async function storeInChromaDB(docs: Document[], collectionName: string = "codebase-gemini") {
  // Using Gemini embeddings. Make sure GOOGLE_API_KEY is set in your environment.
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
  });

  const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName: collectionName,
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  return vectorStore;
}

export async function getVectorStore(collectionName: string = "codebase-gemini") {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
  });

  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: collectionName,
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  return vectorStore;
}
