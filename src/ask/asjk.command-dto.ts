export class askCommandDTO {
    constructor(
        public readonly userID: number,
        public readonly encKey: [number],
        public readonly ivKey: [number],
        public readonly fullName: string,
        public readonly tall: any,
        public readonly weight: any
    ) { }
}