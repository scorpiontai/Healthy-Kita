export class askQueryResult {
    constructor(
        public readonly userID: number,
        public readonly encKey: [number],
        public readonly ivKey: [number]
    ) { }
}