import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  try {
    const { query, topK = 5 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const vectorStore = await getVectorStore();
    const results = await vectorStore.similaritySearch(query, topK);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
