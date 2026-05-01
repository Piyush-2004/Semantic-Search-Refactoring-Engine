import { NextRequest, NextResponse } from "next/server";
import { explainModule } from "@/lib/llm";
import { buildDependencyGraph, getContextWithDependencies } from "@/lib/dependencies";
import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

export async function POST(req: NextRequest) {
  try {
    const { repoPath, targetFilePath } = await req.json();

    if (!repoPath || !targetFilePath) {
      return NextResponse.json({ error: "repoPath and targetFilePath are required" }, { status: 400 });
    }

    const absolutePath = path.resolve(repoPath);
    
    // Simplification: In a real app we'd cache this graph
    const graph = buildDependencyGraph(absolutePath);

    // Get all file contents roughly to build the context
    const files = await glob("**/*.{ts,tsx,js,jsx}", {
        cwd: absolutePath,
        ignore: ["node_modules/**", ".git/**", "dist/**", "build/**"],
    });

    const allContents: Record<string, string> = {};
    for (const file of files) {
        const fullPath = path.join(absolutePath, file);
        try {
            allContents[fullPath] = await fs.readFile(fullPath, "utf-8");
        } catch (e) {
            // Ignore unreadable files
        }
    }

    const context = getContextWithDependencies(path.resolve(repoPath, targetFilePath), graph, allContents);
    
    const explanation = await explainModule(context);

    return NextResponse.json({ explanation }, { status: 200 });
  } catch (error: any) {
    console.error("Explain error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
