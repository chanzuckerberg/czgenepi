import React, { FunctionComponent, useReducer } from "react";
import cx from "classnames";

import style from "./index.module.scss";

interface Props {
    modal: JSX.Element;
    customStyle?: Stylesheet;
}

interface ModalState {
    displayModal: boolean;
}

function modalReducer(state: ModalState, action: ModalState): ModalState {
    return { ...state, ...action };
}

const Modal: FunctionComponent<Props> = ({modal, customStyle, children }): JSX.Element => {
    const [state, dispatch] = useReducer(modalReducer, { displayModal: false })

    function renderElements(state: ModalState): JSX.Element | null {
        const elements = (
            <div className={cx(style.background, customStyle?.background)} onClick={() => dispatch({ displayModal: false })}>
                <div className={style.modal}>
                    {modal}
                </div>
            </div>
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
        <div>
            <div>
                {childrenWithTrigger(children)}
            </div>
            {renderElements(state)}
        </div>
    )
}

export { Modal };
