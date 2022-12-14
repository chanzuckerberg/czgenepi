import csv
from typing import Any, Iterable, Mapping, Set

from fastapi.responses import StreamingResponse

CONTENT_TYPE = {
    "\t": "text/tsv",
    ",": "text/csv",
}


class SimpleStringWriter:
    def __init__(self):
        self.contents = []

    def write(self, data):
        self.contents.append(data)

    def read(self):
        for line in self.contents:
            yield line
        self.contents = []


class FieldSeparatedStreamer:
    fields: Iterable[str] = []
    secondary_fields: Iterable[Iterable[str]] = []

    def __init__(self, delimiter: str, filename: str, data):
        self.delimiter = delimiter
        self.filename = filename
        self.data = data

    def get_response(self):
        generator = self.stream()
        resp = StreamingResponse(generator, media_type="application/binary")
        resp.headers["Content-Disposition"] = f"attachment; filename={self.filename}"
        resp.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        resp.headers["Content-Type"] = CONTENT_TYPE[self.delimiter]
        return resp

    def generate_row(self):
        raise NotImplementedError("Must override generate_row")

    def stream(self):
        stringfh = SimpleStringWriter()
        csvwriter = csv.DictWriter(stringfh, self.fields, delimiter=self.delimiter)
        csvwriter.writeheader()
        for fields_row in self.secondary_fields:
            secondary_header_row: Mapping[str, str] = dict(zip(self.fields, fields_row))
            csvwriter.writerow(secondary_header_row)
            for res in stringfh.read():
                yield res
        for item in self.data:
            csvdata: Mapping[str, Any] = self.generate_row(item)
            csvwriter.writerow(csvdata)
            for res in stringfh.read():
                yield res


class MetadataTSVStreamer(FieldSeparatedStreamer):
    fields = ["Sample Identifier", "Selected"]

    def __init__(self, filename: str, data: Iterable, selected: Iterable):
        super().__init__("\t", filename, data)
        self.selected = [item.lower() for item in selected]

    def generate_row(self, item):
        data: Mapping[str, Any] = {
            "Sample Identifier": item,
            "Selected": "yes" if item.lower() in self.selected else "no",
        }

        return data


class GisaidSubmissionFormCSVStreamer(FieldSeparatedStreamer):
    computer_fields = [
        "submitter",
        "fn",
        "covv_virus_name",
        "covv_type",
        "covv_passage",
        "covv_collection_date",
        "covv_location",
        "covv_add_location",
        "covv_host",
        "covv_add_host_info",
        "covv_sampling_strategy",
        "covv_gender",
        "covv_patient_age",
        "covv_patient_status",
        "covv_specimen",
        "covv_outbreak",
        "covv_last_vaccinated",
        "covv_treatment",
        "covv_seq_technology",
        "covv_assembly_method",
        "covv_coverage",
        "covv_orig_lab",
        "covv_orig_lab_addr",
        "covv_provider_sample_id",
        "covv_subm_lab",
        "covv_subm_lab_addr",
        "covv_subm_sample_id",
        "covv_authors",
    ]
    human_fields = [
        "Submitter",
        "FASTA filename",
        "Virus name",
        "Type",
        "Passage details/history",
        "Collection date",
        "Location",
        "Additional location",
        "Host",
        "Additional host info",
        "Sampling Strategy",
        "Gender",
        "Patient Age",
        "Patient Status",
        "Specimen source",
        "Outbreak",
        "Last vaccinated",
        "Treatment",
        "Sequencing technology",
        "Assembly method",
        "Coverage",
        "Originating lab",
        "Address",
        "Sample ID given by originating laboratory",
        "Submitting lab",
        "Address",
        "Sample ID given by the submitting laboratory",
        "Authors",
    ]
    fields = computer_fields
    secondary_fields = [human_fields]

    preset_fields = {
        "covv_type": "betacoronavirus",
        "covv_passage": "Original",
        "covv_host": "Human",
        "covv_gender": "unknown",
        "covv_patient_age": "unknown",
        "covv_patient_status": "unknown",
        "covv_specimen": "Nasopharyngeal/oropharyngeal swab",
    }

    def __init__(self, filename: str, data: Iterable):
        super().__init__(",", filename, data)

    def generate_row(self, item):
        data: Mapping[str, Any] = {}
        for field in self.fields:
            if field in self.preset_fields:
                data[field] = self.preset_fields[field]
            elif field in item and item.get(field):
                data[field] = item[field]
            else:
                data[field] = ""
        return data


class GenBankSubmissionFormTSVStreamer(FieldSeparatedStreamer):
    fields = [
        "Sequence_ID",
        "collection-date",
        "country",
        "host",
        "isolate",
        "isolation-source",
        "BioProject",
        "BioSample",
        "isolation-source",
    ]

    preset_fields = {
        "host": "Homo sapiens",
    }

    def __init__(self, filename: str, data: Iterable):
        super().__init__("\t", filename, data)

    def generate_row(self, item):
        data: Mapping[str, Any] = {}
        for field in self.fields:
            if field in self.preset_fields:
                data[field] = self.preset_fields[field]
            elif field in item and item.get(field):
                data[field] = item[field]
            else:
                data[field] = ""
        return data


class NextcladeQcMutationsOutputStreamer(FieldSeparatedStreamer):
    """Streamer for downloading QC/Mutations data TSV.

    Unlike other classes in this file, the `fields` of the download are not
    unchanging and instead need to be set on __init__ based on what fields
    were actually present in the data being downloaded.

    The fields are fairly consistent, but there are slight differences between
    pathogens and possibly over version changes / different reference datasets.
    With this in mind, we have a `base_fields` listing that is a sane mashup
    of the various fields we've seen so far, then we restrict that down to
    only those fields actually present on the data, and finally tack on
    any extra fields that were in the data but not in `base_fields`.
    """
    base_fields = [
        "seqName",
        "clade",
        "outbreak",  # seen in MPX, not in SC2
        "lineage",  # seen in MPX, not in SC2
        "Nextclade_pango",  # SC2 only
        "partiallyAliased",  # SC2 only
        "clade_nextstrain",  # SC2 only
        "clade_who",  # SC2 only
        "clade_legacy",  # SC2 only
        "qc.overallScore",
        "qc.overallStatus",
        "totalSubstitutions",
        "totalDeletions",
        "totalInsertions",
        "totalFrameShifts",
        "totalAminoacidSubstitutions",
        "totalAminoacidDeletions",
        "totalAminoacidInsertions",
        "totalMissing",
        "totalNonACGTNs",
        "totalPcrPrimerChanges",
        "substitutions",
        "deletions",
        "insertions",
        "privateNucMutations.reversionSubstitutions",
        "privateNucMutations.labeledSubstitutions",
        "privateNucMutations.unlabeledSubstitutions",
        "privateNucMutations.totalReversionSubstitutions",
        "privateNucMutations.totalLabeledSubstitutions",
        "privateNucMutations.totalUnlabeledSubstitutions",
        "privateNucMutations.totalPrivateSubstitutions",
        "frameShifts",
        "aaSubstitutions",
        "aaDeletions",
        "aaInsertions",
        "missing",
        "nonACGTNs",
        "pcrPrimerChanges",
        "alignmentScore",
        "alignmentStart",
        "alignmentEnd",
        "coverage",
        "qc.missingData.missingDataThreshold",
        "qc.missingData.score",
        "qc.missingData.status",
        "qc.missingData.totalMissing",
        "qc.mixedSites.mixedSitesThreshold",
        "qc.mixedSites.score",
        "qc.mixedSites.status",
        "qc.mixedSites.totalMixedSites",
        "qc.privateMutations.cutoff",
        "qc.privateMutations.excess",
        "qc.privateMutations.score",
        "qc.privateMutations.status",
        "qc.privateMutations.total",
        "qc.snpClusters.clusteredSNPs",
        "qc.snpClusters.score",
        "qc.snpClusters.status",
        "qc.snpClusters.totalSNPs",
        "qc.frameShifts.frameShifts",
        "qc.frameShifts.totalFrameShifts",
        "qc.frameShifts.frameShiftsIgnored",
        "qc.frameShifts.totalFrameShiftsIgnored",
        "qc.frameShifts.score",
        "qc.frameShifts.status",
        "qc.stopCodons.stopCodons",
        "qc.stopCodons.totalStopCodons",
        "qc.stopCodons.score",
        "qc.stopCodons.status",
        "isReverseComplement",
        "failedGenes",
        "warnings",
        "errors",
    ]

    def __init__(self, filename: str, fields_in_use: Set[str], data: Iterable):
        fields = [field for field in self.base_fields if field in fields_in_use]
        addl_fields = fields_in_use.difference(self.base_fields)
        self.fields = fields + list(addl_fields)
        super().__init__("\t", filename, data)

    def generate_row(self, item):
        """Prep of rows handled by `prepare_output_data` in assoc view func"""
        return item
