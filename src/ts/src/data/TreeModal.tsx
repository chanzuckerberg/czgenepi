function createTreeModalInfo(link: string): ModalInfo {
    const modalInfo: ModalInfo = {
        header: "Please confirm you're ready to send your data to Auspice to see your tree.",
        body: "You are leaving Aspen and sending your data to a private visualization on auspice.us, which is not controlled by Aspen.",
        buttons: [{ content: "Confirm", link: link, type: "primary" }, { content: "Cancel", link: "cancel", type: "secondary" }]
    }
    return modalInfo;
}

export { createTreeModalInfo };
