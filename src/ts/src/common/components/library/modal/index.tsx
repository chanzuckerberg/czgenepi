import React, { FunctionComponent, useReducer } from "react";
import cx from "classnames";

import { Button } from "common/components";

import style from "./index.module.scss";

interface Props {
    data: ModalInfo;
    className: string;
    customStyle?: Stylesheet;
}

interface ModalState {
    displayModal: boolean;
}

function modalReducer(state: ModalState, action: ModalState): ModalState {
    return { ...state, ...action };
}

const Modal: FunctionComponent<Props> = ({data, className, customStyle, children }): JSX.Element => {
    const [state, dispatch] = useReducer(modalReducer, { displayModal: false })

    function renderButtons(buttonInfo: ButtonInfo[] | undefined): JSX.Element | null {
        if (buttonInfo === undefined || buttonInfo.length < 1) {
            return null;
        }
        const buttons = buttonInfo.map(button => {
            let link: string | undefined = button.link;
            let onClick: (() => void) | undefined = undefined;
            if (link === "cancel") {
                link = undefined;
                onClick = () => dispatch({ displayModal: false })
            }
            return <Button link={link} type={button.type} onClick={onClick}>{button.content}</Button>
        })

        return <span>{buttons}</span>
    }

    function renderElements(state: ModalState): JSX.Element | null {
        const closeModal = () => dispatch({ displayModal: false })
        const elements = (
            <React.Fragment>
                <div className={style.background} onClick={() => dispatch({ displayModal: false })}>
                </div>
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <div className={style.modalHeader}>
                            {data.header}
                        </div>
                        <div className={style.modalBody}>
                            {data.body}
                        </div>
                        <div className={style.buttons}>
                            {renderButtons(data.buttons)}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
        if (state.displayModal) {
            return elements
        }
        return null
    }

    const childrenWithTrigger = (children: React.ReactNode) => {
        return React.Children.map(children, (child =>
                <span className={style.children} onClick={() => dispatch({ displayModal: true })}>{child}</span>
        ))
    }

    return (
        <React.Fragment>
            <div className={className}>
                {childrenWithTrigger(children)}
            </div>
            {renderElements(state)}
        </React.Fragment>
    )
}

export { Modal };
