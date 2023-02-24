import deepmerge from "deepmerge";
import { gunzip, strFromU8, unzip } from "fflate";
import { ERROR_CODE } from "src/components/WebformTable/common/types";
import {
  FORBIDDEN_NAME_CHARACTERS_REGEX,
  MAX_NAME_LENGTH,
} from "../common/constants";
import {
  ParseErrors,
  ParseFastaSeqIDLineOutcome,
  ParseOutcome,
  ParseOutcomeWithFilenames,
  Samples,
  Sequences,
} from "../common/types";

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
  if (filename.includes(".zip")) {
    return handleZip(file);
  }

  if (filename.includes(".gz")) {
    return handleGz(file, filename);
  }

  if (
    filename.includes(".fasta") ||
    filename.includes(".fa") ||
    filename.includes(".txt")
  ) {
    // FASTA is not a special file encoding, just a way to format a text file.
    return handleFastaText(await strFromU8(file), filename);
  }

  // Encountered unexpected file extension
  return { errors: { [ERROR_CODE.DEFAULT]: [filename] }, result: {} };
}

async function handleGz(
  file: Uint8Array,
  filename: string
): Promise<ParseOutcome> {
  return new Promise((resolve) => {
    gunzip(file, (_, data) => {
      resolve(handleFastaText(strFromU8(data), filename));
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
 * Parses Fasta line containing the sequence's ID, returns ID and if in error.
 */
function handleFastaSeqIdLine(seqIdLine: string): ParseFastaSeqIDLineOutcome {
  let hasError = false;
  // `>` indicates line has ID. We toss it, along with any spaces between it and ID.
  // Regex matches start of the line `>` and as many spaces as appear before ID
  const FASTA_SEQ_ID_PREAMBLE = /^> */;
  const id = seqIdLine.replace(FASTA_SEQ_ID_PREAMBLE, "");
  if (id.length > MAX_NAME_LENGTH || FORBIDDEN_NAME_CHARACTERS_REGEX.test(id)) {
    hasError = true;
  }
  return { hasError, id };
}

/**
 * (thuang): Use two pointers to convert Fasta text into
 * a map with sample id as key and sequence as value in O(N)
 */
function handleFastaText(text: string, filename: string): ParseOutcome {
  // (thuang): Take different operating systems into account
  //  https://stackoverflow.com/a/45709854
  const lines = text.split(/\r?\n/);

  let result: Sequences = {};
  let errors: ParseErrors = {};

  for (let i = 0; i < lines.length; ) {
    const iLine = lines[i];

    // Not sample id
    if (!iLine.includes(">")) {
      i++; // Since not a sample id, move to next line and abandon this one.
      continue;
    }
    // We are working with a sample ID line
    const { id, hasError } = handleFastaSeqIdLine(iLine);

    // Invalid name
    if (hasError) {
      errors = {
        ...errors,
        [ERROR_CODE.INVALID_NAME]: [
          ...(errors[ERROR_CODE.INVALID_NAME] || []),
          filename,
        ],
      };

      i++; // Since sample ID name not allowed, move to next and abandon this one
      continue;
    }

    const { newIndex, sequence } = aggregateSequence(i, lines);
    // Next line read will happen at end of sequence we just aggregated.
    i = newIndex;

    if (sequence) {
      result = {
        ...result,
        [id]: sequence,
      };
    }
  }

  return { errors, result };
}

function aggregateSequence(
  i: number,
  lines: string[]
): { newIndex: number; sequence: string } {
  let newIndex = i;
  let sequence = "";

  // (thuang): `j` starts at `i + 1` to be on the first line of sequence,
  // since `i` should be the `id` line
  for (let j = i + 1; j < lines.length; j++) {
    const jLine = lines[j];

    if (!jLine || jLine.includes(">")) {
      newIndex = j;
      break;
    }

    sequence += jLine;

    // (thuang): j has reached the end of file
    if (j === lines.length - 1) {
      newIndex = lines.length;
    }
  }

  return { newIndex, sequence };
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

export function getUploadCounts(samples: Samples): {
  sampleCount: number;
  fileCount: number;
} {
  const numSamples: number = Object.keys(samples).length;
  const uniqueFiles = new Set();
  Object.values(samples).forEach((entry) => {
    uniqueFiles.add(entry.filename);
  });
  return { fileCount: uniqueFiles.size, sampleCount: numSamples };
}

export function removeSamplesFromTheSameFiles(
  samples: Samples | null,
  newSamples: Samples
): Samples | null {
  if (!samples) return samples;

  const newFiles = new Set(
    Object.values(newSamples).map((sample) => sample.filename)
  );

  const result: Samples = {};

  for (const [id, sample] of Object.entries(samples)) {
    if (newFiles.has(sample.filename)) continue;
    result[id] = sample;
  }

  return result;
}

export function hasSamples(samples: Samples | null): boolean {
  if (!samples) return false;

  return Object.keys(samples).length > 0;
}

export const isSampleQCStatusBad = (sample?: Sample): boolean => {
  const status = getQCStatusFromSample(sample);
  return status === "Bad" || status === "Failed";
};

export function getBadOrFailedQCSampleIds(samples: Sample[]): string[] {
  return (
    samples
      // for now there should only ever be one qcMetrics entry per sample
      .filter(isSampleQCStatusBad)
      .map((s) => s.publicId)
  );
}

export const getQCStatusFromSample = (sample?: Sample): string | undefined => {
  return sample?.qcMetrics?.[0]?.qcStatus;
};
