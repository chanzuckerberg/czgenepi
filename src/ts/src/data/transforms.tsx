import React from "react";

export const TREE_TRANSFORMS: Transform[] = [
    {
        key: "name",
        inputs: ["id", "creationDate"],
        method: (inputs) => {
            // temporary until we use ISO 8601
            if (typeof inputs[1] !== "string") {
                return `${inputs[0]} Ancestors ??????`
            }
            const re = /\d\d(\d\d)-(\d\d)-(\d\d)/
            const matchArray = re.exec(inputs[1])
            if (matchArray === null) {
                return `${inputs[0]} Ancestors ??????`
            }
            return `${inputs[0]} Ancestors ${matchArray[1]}${matchArray[2]}${matchArray[3]}`
        }
    },
    {
        key: "downloadLink",
        inputs: ["id"],
        method: (inputs) => {
            const id = inputs[0]
            if (typeof id !== "number") {
                return undefined
            }
            return <a href={`/api/phylo_tree/${id}`} download>Download</a>
        }
    }
]
