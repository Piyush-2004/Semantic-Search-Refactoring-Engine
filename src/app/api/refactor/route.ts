import { NextRequest, NextResponse } from "next/server";
import { proposeRefactor } from "@/lib/llm";
import { buildDependencyGraph, getContextWithDependencies } from "@/lib/dependencies";
import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

export async function POST(req: NextRequest) {
  try {
    const { repoPath, targetFilePath, prompt } = await req.json();

    if (!repoPath || !targetFilePath || !prompt) {
      return NextResponse.json({ error: "repoPath, targetFilePath, and prompt are required" }, { status: 400 });
    }

    const absolutePath = path.resolve(repoPath);
    
    const graph = buildDependencyGraph(absolutePath);

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
    
    const refactorProposal = await proposeRefactor(context, prompt);

    return NextResponse.json({ refactorProposal }, { status: 200 });
  } catch (error: any) {
    console.error("Refactor error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
