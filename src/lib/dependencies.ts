import { Project, ts } from "ts-morph";
import * as path from "path";

export interface DependencyGraph {
  [filePath: string]: string[]; // maps a file to its dependencies
}

export function buildDependencyGraph(repoPath: string): DependencyGraph {
  const absolutePath = path.resolve(repoPath);
  
  const project = new Project({
    compilerOptions: {
      allowJs: true,
    },
  });

  // Add all TS/JS files in the repo
  project.addSourceFilesAtPaths(`${absolutePath}/**/*.{ts,tsx,js,jsx}`);

  const sourceFiles = project.getSourceFiles();
  const graph: DependencyGraph = {};

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const imports = sourceFile.getImportDeclarations();
    
    const dependencies: string[] = [];

    for (const imp of imports) {
      const moduleSpecifierSourceFile = imp.getModuleSpecifierSourceFile();
      if (moduleSpecifierSourceFile) {
        dependencies.push(moduleSpecifierSourceFile.getFilePath());
      }
    }

    // Also check dynamic imports
    const callExpressions = sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression);
    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        if (expression.getKind() === ts.SyntaxKind.ImportKeyword) {
           const args = callExpr.getArguments();
           if (args.length > 0) {
               // A full resolution here requires type checker, this is a simplification
               const moduleName = args[0].getText().replace(/['"`]/g, '');
               dependencies.push(`dynamic_import:${moduleName}`);
           }
        }
    }

    graph[filePath] = dependencies;
  }

  return graph;
}

export function getContextWithDependencies(targetFilePath: string, graph: DependencyGraph, allContents: Record<string, string>): string {
   let context = `--- Target File: ${targetFilePath} ---\n`;
   context += allContents[targetFilePath] || "";
   
   const deps = graph[targetFilePath] || [];
   if (deps.length > 0) {
       context += `\n\n--- Dependencies ---\n`;
       for (const dep of deps) {
          if (!dep.startsWith("dynamic_import:")) {
             context += `\n--- File: ${dep} ---\n`;
             context += allContents[dep] || "// Content not found";
          }
       }
   }

   return context;
}
