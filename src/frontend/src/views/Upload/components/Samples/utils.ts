import deepmerge from "deepmerge";
import { gunzip, strFromU8, unzip } from "fflate";
import {
  ERROR_CODE,
  ParseErrors,
  ParseOutcome,
  ParseOutcomeWithFilenames,
  Samples,
  Sequences,
} from "../common/types";

const MAX_NAME_LENGTH = 120;

export async function handleFiles(
  files: FileList
): Promise<ParseOutcomeWithFilenames> {
  let finalResult: Samples = {};
  let finalErrors: ParseErrors = {};

  for (const file of Array.from(files)) {
    const { result, errors } = await handleFile(
      file.name,
      new Uint8Array(await file.arrayBuffer())
    );

    const samplesWithFilename = Object.fromEntries(
      Object.entries(result).map(([key, sample]) => {
        return [
          key,
          {
            filename: file.name,
            sequence: sample,
          },
        ];
      })
    );

    finalResult = { ...finalResult, ...samplesWithFilename };
    finalErrors = deepmerge(finalErrors, errors);
  }

  return { errors: finalErrors, result: finalResult };
}

export async function handleFile(
  filename: string,
  file: Uint8Array
): Promise<ParseOutcome> {
  if (filename.includes(" ") || filename.length > MAX_NAME_LENGTH) {
    return { errors: { [ERROR_CODE.INVALID_NAME]: [filename] }, result: {} };
  }

  if (filename.includes(".zip")) {
    return handleZip(file);
  }

  if (filename.includes(".gz")) {
    return handleGz(file);
  }

  if (filename.includes(".fasta") || filename.includes(".fa")) {
    return handleFastaText(await strFromU8(file));
  }

  return { errors: { [ERROR_CODE.DEFAULT]: [filename] }, result: {} };
}

async function handleGz(file: Uint8Array): Promise<ParseOutcome> {
  return new Promise((resolve) => {
    gunzip(file, (_, data) => {
      resolve(handleFastaText(strFromU8(data)));
    });
  });
}

async function handleZip(file: Uint8Array): Promise<ParseOutcome> {
  const files = await unzipToFiles(file);

  let finalResult = {};
  let finalErrors = {};

  for (const [key, unit8Array] of Object.entries(files)) {
    const { result, errors } = await handleFile(key, unit8Array);

    finalResult = { ...finalResult, ...result };
    finalErrors = deepmerge(finalErrors, errors);
  }

  return { errors: finalErrors, result: finalResult };
}

/**
 * (thuang): Use two pointers to convert Fasta text into
 * a map with sample id as key and sequence as value in O(N)
 */
function handleFastaText(text: string): ParseOutcome {
  const lines = text.split("\n");

  let result: Sequences = {};
  let errors: ParseErrors = {};

  for (let i = 0; i < lines.length; ) {
    const iLine = lines[i];

    // Not sample id
    if (!iLine.includes(">")) {
      i++;
      continue;
    }

    // Invalid name
    if (iLine.includes(" ") || iLine.length > MAX_NAME_LENGTH) {
      errors = {
        ...errors,
        [ERROR_CODE.INVALID_NAME]: [
          ...(errors[ERROR_CODE.INVALID_NAME] || []),
          iLine,
        ],
      };

      i++;
      continue;
    }

    // Aggregate sequence line by line
    for (let j = i + 1; j < lines.length; j++) {
      const jLine = lines[j];

      if (!jLine || jLine.includes(">")) {
        i = j;
        break;
      }

      const id = iLine.replace(">", "");

      result = {
        ...result,
        [id]: (result[id] || "") + jLine,
      };
    }
  }

  return { errors, result };
}

function unzipToFiles(file: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve) => {
    unzip(file, (_, files) => {
      const ignoreFiles = ["__MACOSX", ".DS_Store"];

      const validFiles: Record<string, Uint8Array> = {};

      for (const [key, unit8Array] of Object.entries(files)) {
        // (thuang): Skip junk files
        // e.g., __MACOSX/._sample.fa
        // https://perishablepress.com/remove-macosx-ds-store-zip-files-mac/
        if (ignoreFiles.some((ignoreFile) => key.includes(ignoreFile))) {
          continue;
        }

        validFiles[key] = unit8Array;
      }

      resolve(validFiles);
    });
  });
}
