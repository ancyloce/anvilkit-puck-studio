import type { Data } from "@puckeditor/core";

export interface ExportJsonOptions {
  filenameBase?: string | null;
  document?: Document;
}

function getFilename(filenameBase?: string | null): string {
  const safeBase = filenameBase?.trim() || "page";
  return `${safeBase}.json`;
}

export function exportDataAsJson(
  data: Data,
  { filenameBase, document: targetDocument }: ExportJsonOptions = {},
): void {
  const resolvedDocument =
    targetDocument ?? (typeof document !== "undefined" ? document : undefined);

  if (!resolvedDocument) return;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = resolvedDocument.createElement("a");

  link.href = url;
  link.download = getFilename(filenameBase);
  link.click();

  URL.revokeObjectURL(url);
}
