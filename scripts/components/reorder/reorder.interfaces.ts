interface IDropZone {
    value: any,
    rect: ClientRect
}

interface IReorderOptions {
    item: HTMLElement,
    offset: {
        x: number,
        y: number
    },
    dropZones: Array<IDropZone>
}

export {
    IDropZone,
    IReorderOptions
}