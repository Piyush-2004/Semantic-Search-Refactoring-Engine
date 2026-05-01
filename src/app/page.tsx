"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Database, Search, Sparkles, Wand2, FileCode2, Loader2, GitBranch } from "lucide-react";

export default function Home() {
  const [repoPath, setRepoPath] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [refactorPrompt, setRefactorPrompt] = useState("");

  const handleIngest = async () => {
    if (!repoPath) return;
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath }),
      });
      const data = await res.json();
      if (res.ok) {
        setIngestResult(`Successfully ingested ${data.fileCount} files into ${data.chunkCount} chunks.`);
      } else {
        setIngestResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setIngestResult(`Error: ${e.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleExplain = async () => {
    if (!selectedFile || !repoPath) return;
    setLlmLoading(true);
    setLlmResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath, targetFilePath: selectedFile }),
      });
      const data = await res.json();
      if (res.ok) {
        setLlmResult(data.explanation);
      } else {
        setLlmResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setLlmResult(`Error: ${e.message}`);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleRefactor = async () => {
    if (!selectedFile || !repoPath || !refactorPrompt) return;
    setLlmLoading(true);
    setLlmResult(null);
    try {
      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath, targetFilePath: selectedFile, prompt: refactorPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setLlmResult(data.refactorProposal);
      } else {
        setLlmResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setLlmResult(`Error: ${e.message}`);
    } finally {
      setLlmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Semantic Search + Refactoring Engine
            </h1>
            <p className="text-slate-400 text-sm">AI-powered codebase understanding and automated refactoring</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Ingestion & Search */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ingestion Card */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Repository Ingestion
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Point the engine to a local repository path to crawl and embed the code.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Input 
                    placeholder="e.g. /Users/name/projects/my-app" 
                    value={repoPath}
                    onChange={(e) => setRepoPath(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-200"
                  />
                  <Button onClick={handleIngest} disabled={ingesting || !repoPath} className="bg-indigo-600 hover:bg-indigo-700">
                    {ingesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Ingest Repo
                  </Button>
                </div>
                {ingestResult && (
                  <div className="text-sm p-3 rounded-md bg-slate-800/50 text-emerald-400 border border-emerald-500/20">
                    {ingestResult}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Semantic Search Card */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Search className="w-5 h-5 text-indigo-400" />
                  Semantic Search
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Ask a question about the codebase..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-950 border-slate-800 text-slate-200"
                  />
                  <Button onClick={handleSearch} disabled={searching || !query} variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                    {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Search
                  </Button>
                </div>

                <ScrollArea className="h-[400px] w-full rounded-md border border-slate-800 bg-slate-950/50 p-4">
                  {searchResults.length === 0 ? (
                    <div className="text-slate-500 text-center py-12">No results yet. Run a query above.</div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((result, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedFile(result.metadata.source)}
                        >
                          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-400 font-mono">
                            <FileCode2 className="w-3 h-3" />
                            {result.metadata.source}
                          </div>
                          <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono p-3 bg-slate-950 rounded border border-slate-800">
                            {result.pageContent}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: AI Reasoning & Refactoring */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="bg-slate-900 border-slate-800 shadow-xl h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Wand2 className="w-5 h-5 text-amber-400" />
                  AI Reasoning Engine
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select a file from search results to explain or refactor it.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                
                <div className="p-3 bg-slate-950 rounded-md border border-slate-800 flex items-center gap-2 text-sm text-slate-300 break-all">
                  <GitBranch className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  {selectedFile ? selectedFile : "No file selected"}
                </div>

                <Button 
                  onClick={handleExplain} 
                  disabled={!selectedFile || llmLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20"
                >
                  {llmLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Explain this Module"}
                </Button>

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Automated Refactor</label>
                  <Textarea 
                    placeholder="E.g. Refactor this to use React hooks instead of class components..."
                    value={refactorPrompt}
                    onChange={(e) => setRefactorPrompt(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-200 resize-none h-24"
                  />
                  <Button 
                    onClick={handleRefactor} 
                    disabled={!selectedFile || !refactorPrompt || llmLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {llmLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Propose Refactor"}
                  </Button>
                </div>

                <ScrollArea className="flex-1 mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-4 min-h-[300px]">
                  {llmResult ? (
                     <div className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {/* A real app would use a markdown renderer here */}
                        {llmResult}
                     </div>
                  ) : (
                    <div className="text-slate-500 text-center py-12 flex flex-col items-center justify-center h-full">
                      <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                      AI insights will appear here
                    </div>
                  )}
                </ScrollArea>

              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
