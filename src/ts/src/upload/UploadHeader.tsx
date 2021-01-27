import { Step } from "./types";

import React from "react";
import { startCase } from "lodash/fp";
import { Label } from "semantic-ui-react";
import { Link } from "cz-ui";
import cx from "classnames";

import style from "./index.module.scss";

const MENU_OPTIONS = [
    {
        text: "Samples",
        step: Step.UploadSamples,
    },
    {
        text: "Metadata",
        step: Step.UploadMetadata,
    },
    {
        text: "Review",
        step: Step.Review,
    },
];

interface IProps {
    currentStep: Step;
    samples: Array<Sample>;
    project: Project;
    onStepSelect: (step: Step) => void;
    stepsEnabled: Record<string, boolean>;
}

export default function UploadHeader(props: IProps): JSX.Element {
    const isStepEnabled = (step: Step) => {
        return props.stepsEnabled[step];
    };

    const onStepSelect = (step: Step) => {
        if (isStepEnabled(step)) {
            props.onStepSelect(step);
        }
    };

    const { currentStep } = props;
    return (
        <div className={style.headerWrapper}>
            <div>
                <div className={style.sampleUploadFlowHeader}>
                    <div className={style.titleContainer}>
                        <div className={style.title}>
                            {startCase(currentStep)}
                        </div>
                        {currentStep === Step.UploadSamples && (
                            <div className={style.subtitle}>
                                Select input files.
                            </div>
                        )}
                        {currentStep === Step.UploadMetadata && (
                            <div className={style.subtitle}>
                                This metadata will provide context around your
                                samples and results in IDseq.
                            </div>
                        )}
                        {currentStep === Step.Review && (
                            <div className={style.subtitle}>
                                Uploading {props.samples.length} samples to{" "}
                                {props.project.name}
                            </div>
                        )}
                    </div>
                    <div className={style.fill} />
                    <div className={style.menu}>
                        {MENU_OPTIONS.map((val, index) => (
                            <div
                                className={cx(
                                    style.option,
                                    currentStep === val.step && style.active,
                                    currentStep !== val.step &&
                                        isStepEnabled(val.step) &&
                                        style.enabled
                                )}
                                key={val.text}
                                onClick={() => {
                                    onStepSelect(val.step);
                                }}
                            >
                                <Label className={style.circle} circular={true}>
                                    {index + 1}
                                </Label>
                                <div className={style.text}>{val.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
