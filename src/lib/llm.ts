import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const getModel = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash", // Fast and free-tier generous
    temperature: 0.2,
  });
};

export async function explainModule(codeContext: string): Promise<string> {
  const model = getModel();

  const response = await model.invoke([
    new SystemMessage("You are an expert software engineer. Your task is to explain the given code module, its purpose, and its immediate dependencies clearly and concisely."),
    new HumanMessage(`Please explain the following code and its dependencies:\n\n${codeContext}`)
  ]);

  return response.content as string;
}

export async function proposeRefactor(codeContext: string, userPrompt: string): Promise<string> {
  const model = getModel();

  const response = await model.invoke([
    new SystemMessage("You are an expert software engineer. You will receive a code module and its context. Your task is to propose an automated refactor based on the user's instructions. Return only the refactored code diff or the full refactored file content, wrapped in markdown code blocks. Explain the changes briefly before the code block."),
    new HumanMessage(`Code Context:\n\n${codeContext}\n\nRefactoring Request:\n${userPrompt}`)
  ]);

  return response.content as string;
}
