export interface APIResponse {
    class: string;
    label: string;
    source: string;
    updated: string;
    id: string[];
    size: number[];
    dimension: {
        PetroleumProd: {
            extension: {
                show: string;
            };
            label: string;
            category: {
                index: Record<string, number>;
                label: Record<string, string>;
            };
        };
        ContentsCode: {
            extension: {
                show: string;
            };
            label: string;
            category: {
                index: Record<string, number>;
                label: Record<string, string>;
                unit: {
                    Priser: {
                        base: string;
                        decimals: number;
                    };
                };
            };
        };
        Tid: {
            extension: {
                show: string;
            };
            label: string;
            category: {
                index: Record<string, number>;
                label: Record<string, string>;
            };
        };
    };
    value: number[];
    role: {
        time: string[];
        metric: string[];
    };
    version: string;
    extension: {
        px: {
            infofile: string;
            tableid: string;
            decimals: number;
        };
    };
}