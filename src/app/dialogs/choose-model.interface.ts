export interface Data {
    title: string;
    text: string;
    options: Option[];
}

export interface Option {
    name: string;
    urn: string;
    filePaths: string[];
}