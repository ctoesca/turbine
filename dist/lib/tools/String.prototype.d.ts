declare global  {
    interface String {
        rightOf(s: string): string;
        leftOf(s: string): string;
        rightRightOf(s: string): string;
        removeEnd(s: string, caseInsensistive: boolean): string;
        stripAccents(): string;
        sha1(): string;
        hashCode(): number;
        contains(s: string): boolean;
    }
}
export {};
