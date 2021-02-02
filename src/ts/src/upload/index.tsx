import { Step } from "./types";

import React, { useState } from "react";

import UploadHeader from "./UploadHeader";

import style from "./index.module.scss";

interface IProps {
    csrf?: string;
    hostGenomes?: Array<HostGenome>;
    admin?: boolean;
    biohubS3UploadEnabled?: boolean;
    basespaceClientId?: string;
    basespaceOauthRedirectUri?: string;
}

export default function Upload(_props: IProps): JSX.Element {
    const [currentStep, setCurrentStep] = useState<Step>(Step.UploadSamples);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [samples, setSamples] = useState<Array<Sample>>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [project, setProject] = useState<Project | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [stepsEnabled, setStepsEnabled] = useState({
        uploadSamples: true,
        uploadMetadata: false,
        review: false,
    });

    const handleStepSelect = (step: Step): void => {
        setCurrentStep(step);
    };

    return (
        <div>
            <UploadHeader
                currentStep={currentStep}
                samples={samples}
                project={project}
                onStepSelect={handleStepSelect}
                stepsEnabled={stepsEnabled}
            />
            <div className={style.sampleUploadFlow}>
                <div className={style.inner}>{"Steps go here."}</div>
            </div>
        </div>
    );
}
