export class askQueryResult {
    constructor(
        public readonly userID: any,
        public readonly encKey: [number],
        public readonly ivKey: [number]
    ) { }
}