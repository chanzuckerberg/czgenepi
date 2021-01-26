import React, { useState, useEffect } from "react";
import cx from "classnames";
import { get, without, flow, omit, set, find } from "lodash/fp";

import UploadSampleStep from "./UploadSampleStep";
import UploadMetadataStep from "./UploadMetadataStep";
import UploadReviewStep from "./UploadReviewStep";
import UploadFlowHeader from "./UploadHeader";

import style from "./index.module.scss"

// See HOST_GENOME_SYNONYMS in MetadataField
const HOST_GENOME_SYNONYMS = [
"host_genome",
"Host Genome",
"host_organism",
"Host Organism",
];

enum Step {
    UploadSamples,
    UploadMetadata,
    Review,
}

interface HostGenome {
    id: number;
    name: string;
    samplesCount: number;
    erccOnly: boolean;
}

interface IProps {
  csrf?: string;
  hostGenomes?: Array<HostGenome>;
  admin?: boolean;
  biohubS3UploadEnabled?: boolean;
  basespaceClientId?: string;
  basespaceOauthRedirectUri?: string;
};

export default function Upload(props: IProps): JSX.Element {

    const [currentStep, setCurrentStep] = useState<Step>(Step.UploadSamples);
    const [samples, setSamples] = useState<Array<any>>([]);
    const [uploadType, setUploadType] = useState<string>("");
    const [project, setProject] = useState<any>(null);
    const [sampleNamesToFiles, setSampleNamesToFiles] = useState<any>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [metadataIssues, setMetadataIssues] = useState<any>(null);
    // const [stepsEnabled, setStepsEnabled] = useState({ uploadSamples: true, uploadMetadata: false, review: false })
    const [hostGenomes, setHostGenomes] = useState<Array<any>>([]);
    const [workflows, setWorkflows] = useState(new Set());
    const [wetlabProtocol, setWetlabProtocol] = useState<any>(null);

    window.onbeforeunload = () => "Are you sure you want to leave? All data will be lost.";

    const onUploadComplete = () => {
        window.onbeforeunload = null;
    };

    const handleUploadSamples = ({
        samples,
        project,
        uploadType,
        sampleNamesToFiles,
        workflows,
        wetlabProtocol,
    }: Record<string, any>) => {
        setCurrentStep(Step.UploadMetadata);
        setProject(project);
        setSampleNamesToFiles(sampleNamesToFiles);
        // setStepsEnabled(set(Step.uploadMetadata, true, stepsEnabled));
        setUploadType(uploadType);
        setWetlabProtocol(wetlabProtocol);
        setWorkflows(workflows);
    };

    const handleUploadMetadata = ({ metadata, issues, newHostGenomes }: Record<string, any>) => {
        const currentHostGenomes: Array<HostGenome> = hostGenomes ?? []
        const updatedHostGenomes = currentHostGenomes.concat(newHostGenomes)

        // Populate host_genome_id in sample using metadata.
        const newSamples: Array<any> = []
        samples.forEach(sample => {
            const metadataRow = find(
                row =>
                get("sample_name", row) === sample.name ||
                get("Sample Name", row) === sample.name,
                metadata.rows
                );
            const hostGenomeName: string = HOST_GENOME_SYNONYMS.reduce(
                (match, name) => metadataRow[name] || match,
                ""
                );
            const hostGenomeId = find(
                // Lowercase to allow for 'human' to match 'Human'. The same logic
                // is replicated in MetadataHelper.
                hg => {
                    return hg.name.toLowerCase() === hostGenomeName.toLowerCase();
                },
                updatedHostGenomes
                )?.id ?? null;

            newSamples.push({
                ...sample,
                // Set the host_genome_id and name so it is available in review
                host_genome_id: hostGenomeId,
                host_genome_name: hostGenomeName,
            });
        });

        // Remove host_genome from metadata.
        const newMetadata = flow(
            set("rows", metadata.rows.map(omit(HOST_GENOME_SYNONYMS))),
            set("headers", without(HOST_GENOME_SYNONYMS, metadata.headers))
            )(metadata);

        setSamples(newSamples);
        setMetadata(newMetadata);
        setMetadataIssues(issues);
        setCurrentStep(Step.Review);
        // setStepsEnabled(set("review", true, this.state.stepsEnabled));
        setHostGenomes(updatedHostGenomes)
    };

    const samplesChanged = () => {
        // setStepsEnabled({
        //     stepsEnabled: {
        //         uploadSamples: true,
        //         uploadMetadata: false,
        //         review: false,
        //     },
        // })
    };

    const metadataChanged = () => {
        // setStepsEnabled({
        //     stepsEnabled: {
        //         uploadSamples: true,
        //         uploadMetadata: true,
        //         review: false,
        //     },
        // })
    };

    const handleStepSelect = (step: Step) => {
        setCurrentStep(step)
    };

    const onUploadStatusChange = (uploadStatus: any) => {
        // setStepsEnabled(
        //     stepsEnabled: {
        //         uploadSamples: !uploadStatus,
        //         uploadMetadata: !uploadStatus,
        //         review: !uploadStatus,
        //     }
        // )
    };

    // Original IDSeq comment:
    // SLIGHT HACK: Keep steps mounted, so user can return to them if needed.
    // The internal state of some steps is difficult to recover if they are unmounted.
    const renderSteps = () => {
        return (
            <div>
                <UploadSampleStep
                onDirty={samplesChanged}
                onUploadSamples={handleUploadSamples}
                visible={currentStep === Step.UploadSamples}
                basespaceClientId={props.basespaceClientId}
                basespaceOauthRedirectUri={props.basespaceOauthRedirectUri}
                admin={props.admin}
                biohubS3UploadEnabled={props.biohubS3UploadEnabled}
                />
                {samples && (
                    <UploadMetadataStep
                    onUploadMetadata={handleUploadMetadata}
                    samples={samples}
                    project={project}
                    visible={currentStep === Step.UploadMetadata}
                    onDirty={metadataChanged}
                    workflows={workflows}
                    />
                    )}
                {samples && metadata && (
                    <UploadReviewStep
                    hostGenomes={hostGenomes}
                    metadata={metadata}
                    onStepSelect={handleStepSelect}
                    onUploadComplete={onUploadComplete}
                    onUploadStatusChange={onUploadStatusChange}
                    originalHostGenomes={props.hostGenomes}
                    project={project}
                    sampleNamesToFiles={sampleNamesToFiles}
                    samples={samples}
                    uploadType={uploadType}
                    visible={currentStep === Step.Review}
                    wetlabProtocol={wetlabProtocol}
                    workflows={workflows}
                    />
                    )}
            </div>
            );
    };

    return (
        <div>
            <UploadFlowHeader
            currentStep={currentStep}
            samples={samples}
            project={project}
            onStepSelect={handleStepSelect}
            // stepsEnabled={stepsEnabled}
            />
            <div className={cx(style.sampleUploadFlow)}>
                <div className={style.inner}>{renderSteps()}</div>
            </div>
        </div>
        );
}
