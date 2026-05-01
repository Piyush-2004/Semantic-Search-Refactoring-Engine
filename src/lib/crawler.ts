import { glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";

export interface FileDocument {
  pageContent: string;
  metadata: {
    source: string;
    language: string;
  };
}

export async function crawlRepository(repoPath: string): Promise<FileDocument[]> {
  const absolutePath = path.resolve(repoPath);
  
  // Find all TypeScript/JavaScript files, ignoring node_modules and hidden directories
  const files = await glob("**/*.{ts,tsx,js,jsx}", {
    cwd: absolutePath,
    ignore: ["node_modules/**", ".git/**", "dist/**", "build/**"],
  });

  const documents: FileDocument[] = [];

  for (const file of files) {
    const fullPath = path.join(absolutePath, file);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      
      let language = "typescript";
      if (file.endsWith(".js") || file.endsWith(".jsx")) {
        language = "javascript";
      }

      documents.push({
        pageContent: content,
        metadata: {
          source: fullPath,
          language: language,
        },
      });
    } catch (error) {
      console.warn(`Failed to read file ${fullPath}:`, error);
    }
  }

  return documents;
}
