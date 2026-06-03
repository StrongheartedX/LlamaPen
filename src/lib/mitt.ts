import mitt from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

type Events = {
    scrollToBottom: {
        force: boolean,
    },
    openNotConnectedPopup: void,
    openLightbox: {
        image: File | Blob,
    },
    openSearchbox: void,
    openChat: string,
    stopChatGeneration: void,
    hideSidebar: void,
    focusInputBar: void,
    modelSelectFocusFilter: void,
    shortcutsPopup: void,
    upsertProviderPopup?: {
        key: string;
        name?: string;
        baseURL?: string;
        apiKey?: string;
    }
};

export const emitter = mitt<Events>();