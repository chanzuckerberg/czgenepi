import React, { FunctionComponent, useReducer } from "react";
import cx from "classnames";

import style from "./index.module.scss";

interface Props {
    modal: JSX.Element;
    className: string;
    customStyle?: Stylesheet;
}

interface ModalState {
    displayModal: boolean;
}

function modalReducer(state: ModalState, action: ModalState): ModalState {
    return { ...state, ...action };
}

const Modal: FunctionComponent<Props> = ({modal, className, customStyle, children }): JSX.Element => {
    const [state, dispatch] = useReducer(modalReducer, { displayModal: false })

    function renderElements(state: ModalState): JSX.Element | null {
        const closeModal = () => dispatch({ displayModal: false })
        const elements = (
            <React.Fragment>
                <div className={style.background} onClick={() => dispatch({ displayModal: false })}>
                </div>
                <div className={style.modal}>
                    {modal}
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
