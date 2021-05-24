## Workflows

Aspen has a number of long-lived workflows that are run through [miniwdl](https://github.com/chanzuckerberg/miniwdl/)/[Swipe](https://github.com/chanzuckerberg/swipe)/AWS Batch.  This document explains each of these workflows.

### GISAID Workflow

This workflow encompasses three processing steps to ingest a GISAID data dump into an aligned set of sequences for usage in the Nextstrain pipeline.

#### Ingest

This workflow downloads a [GISAID hCov-19 data dump](https://www.gisaid.org/) and records a [`RawGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+RawGisaidDump%22) object referencing the dump.

#### Transform

This workflow applies the [transform-gisaid script](https://github.com/nextstrain/ncov-ingest/blob/master/bin/transform-gisaid) to transform the metadata into the format expected by the nextstrain pipeline.  The input for this workflow is a [`RawGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+RawGisaidDump%22) object and records a [`ProcessedGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+ProcessedGisaidDump%22) object referencing the processed dump.  A [`GisaidDumpWorkflow`](https://github.com/chanzuckerberg/aspen/search?q=%22class+GisaidDumpWorkflow%22) is used to link the input to the output.

#### Align

This workflow aligns the sequences downloaded from gisaid to a reference sequence, using the align step in the [nextstrain workflow](https://github.com/nextstrain/ncov/blob/master/workflow/snakemake_rules/main_workflow.smk).  The input for this workflow is a [`ProcessedGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+ProcessedGisaidDump%22) object and records an [`AlignedGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+AlignedGisaidDump%22) object referencing the aligned dump.  A [`GisaidAlignmentWorkflow`](https://github.com/chanzuckerberg/aspen/search?q=%22class+GisaidAlignmentWorkflow%22) is used to link the input to the output.

### Nextstrain Workflow

This workflow pulls the inputs for a [`PhyloRun`](https://github.com/chanzuckerberg/aspen/search?q=%22class+PhyloRun%22), which consists of [`UploadedPathogenGenome`](https://github.com/chanzuckerberg/aspen/search?q=%22class+UploadedPathogenGenome%22), [`CalledPathogenGenome`](https://github.com/chanzuckerberg/aspen/search?q=%22class+CalledPathogenGenome%22), and [`AlignedGisaidDump`](https://github.com/chanzuckerberg/aspen/search?q=%22class+AlignedGisaidDump%22).  It creates a builds file based on templates in [build_templates](../../src/backend/aspen/workflows/nextstrain_run/builds_templates/), and then kicks off a nextstrain run.

Normally, the Nextstrain pipeline takes unaligned data and builds a tree from that data.  Repeatedly aligning the GISAID data, however, is wasteful.  Instead, we [cache the aligned data](#align) and inject it into the working directory of the Nextstrain pipeline.  Snakemake assumes the alignment has been done by a prior run, and does not attempt to do it.

The input for this workflow is a [`PhyloRun`](https://github.com/chanzuckerberg/aspen/search?q=%22class+PhyloRun%22), and the output is a [`PhyloTree`](https://github.com/chanzuckerberg/aspen/search?q=%22class+PhyloTree%22) object.
