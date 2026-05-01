import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { FileDocument } from "./crawler";

export async function chunkDocuments(files: FileDocument[]): Promise<Document[]> {
  const codeSplitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkSize: 5000,
    chunkOverlap: 500,
  });

  const chunkedDocs: Document[] = [];

  for (const file of files) {
    const docs = await codeSplitter.createDocuments(
      [file.pageContent],
      [file.metadata]
    );
    
    chunkedDocs.push(...docs);
  }

  return chunkedDocs;
}
