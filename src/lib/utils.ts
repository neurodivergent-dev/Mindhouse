import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert markdown to plain text suitable for speech synthesis
export const markdownToPlainText = (markdown: string): string =>
  markdown
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold **text**
    .replace(/\*(.*?)\*/g, "$1") // Remove italic *text*
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert [link](url) to text
    .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet list markers
    .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list markers
    .replace(/\n\s*\n/g, ". ") // Double newlines to sentence break
    .replace(/\n/g, " ") // Newlines to spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
