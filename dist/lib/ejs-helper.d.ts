import { Schema } from './types';
export declare function getFormInput(schema: Schema): string;
export declare function getRequiredText(schema: Schema): "required" | "";
export declare function getTextInput(schema: Schema): string;
export declare function getMarkDown(schema: Schema): string;
export declare function getPaginationData(prelink: string, current: number, totalResult: number, rowsPerPage?: number): any;
