import React, { FunctionComponent } from "react";

import style from "./index.module.scss";

interface Props {
    link?: string
}

const TreeModal: FunctionComponent<Props> = ({ link }): JSX.Element => {
    return (
        <div className={style.treeModal}>
            <div className={style.modalContent}>
                <div className={style.modalHeader}>
                    Please confirm you're ready to send your data to Auspice to see your tree.
                </div>
                <div className={style.modalBody}>
                    You are leaving Aspen and sending your data to a private visualization on auspice.us,
                    which is not controlled by Aspen.
                </div>
            </div>
        </div>
    )
}

export { TreeModal };
