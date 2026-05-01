import { NextRequest, NextResponse } from "next/server";
import { crawlRepository } from "@/lib/crawler";
import { chunkDocuments } from "@/lib/chunker";
import { storeInChromaDB } from "@/lib/embeddings";
import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;
  try {
    const { repoPath } = await req.json();

    if (!repoPath) {
      return NextResponse.json({ error: "repoPath is required" }, { status: 400 });
    }

    let actualPath = repoPath;
    const isUrl = repoPath.startsWith("http://") || repoPath.startsWith("https://");

    if (isUrl) {
      tempDir = path.join(os.tmpdir(), `repo-ingest-${Date.now()}`);
      console.log(`Cloning repository ${repoPath} into ${tempDir}...`);
      await execAsync(`git clone ${repoPath} ${tempDir}`);
      actualPath = tempDir;
    }

    console.log(`Starting ingestion for ${actualPath}...`);

    const files = await crawlRepository(actualPath);
    console.log(`Found ${files.length} valid files to ingest.`);

    if (files.length === 0) {
       return NextResponse.json({ message: "No valid files found." }, { status: 200 });
    }

    const chunkedDocs = await chunkDocuments(files);
    console.log(`Chunked into ${chunkedDocs.length} chunks.`);

    await storeInChromaDB(chunkedDocs);
    console.log(`Successfully stored in ChromaDB.`);

    return NextResponse.json({
      message: "Ingestion completed successfully",
      fileCount: files.length,
      chunkCount: chunkedDocs.length
    }, { status: 200 });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  } finally {
    if (tempDir) {
      console.log(`Cleaning up temporary directory ${tempDir}...`);
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to clean up ${tempDir}:`, err);
      }
    }
  }
}
