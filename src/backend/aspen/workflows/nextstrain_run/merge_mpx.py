import csv
import io

import click
from Bio import SeqIO


@click.command("merge")
@click.option("--unique-column", type=str, required=True)
@click.option(
    "required_metadata_fh", "--required-metadata", type=click.File("r"), required=True
)
@click.option(
    "required_sequences_fh", "--required-sequences", type=click.File("r"), required=True
)
@click.option(
    "upstream_metadata_fh", "--upstream-metadata", type=click.File("r"), required=True
)
@click.option(
    "upstream_sequences_fh", "--upstream-sequences", type=click.File("r"), required=True
)
@click.option(
    "destination_metadata_fh",
    "--destination-metadata",
    type=click.File("w"),
    required=True,
)
@click.option(
    "destination_sequences_fh",
    "--destination-sequences",
    type=click.File("w"),
    required=True,
)
def cli(
    unique_column: str,
    required_metadata_fh: io.TextIOBase,
    required_sequences_fh: io.TextIOBase,
    upstream_metadata_fh: io.TextIOBase,
    upstream_sequences_fh: io.TextIOBase,
    destination_metadata_fh: io.TextIOWrapper,
    destination_sequences_fh: io.TextIOWrapper,
):
    required_ids = set([])
    required_sequences = SeqIO.parse(required_sequences_fh, "fasta")
    for record in required_sequences:
        SeqIO.write(record, destination_sequences_fh, "fasta-2line")
        required_ids.add(record.id)

    upstream_sequences = SeqIO.parse(upstream_sequences_fh, "fasta")
    unique_records_iterator = (
        item for item in upstream_sequences if item.id not in required_ids
    )
    SeqIO.write(unique_records_iterator, destination_sequences_fh, "fasta-2line")

    required_metadata: csv.DictReader = csv.DictReader(
        required_metadata_fh, delimiter="\t"
    )
    upstream_metadata: csv.DictReader = csv.DictReader(
        upstream_metadata_fh, delimiter="\t"
    )
    destination_metadata: csv.DictWriter = csv.DictWriter(
        destination_metadata_fh, fieldnames=upstream_metadata.fieldnames
    )
    destination_metadata.writeheader()
    for row in required_metadata:
        destination_metadata.writerow(row)
    for row in upstream_metadata:
        if row[unique_column] in required_ids:
            continue
        destination_metadata.writerow(row)


if __name__ == "__main__":
    cli()
