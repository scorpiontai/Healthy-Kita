export class askQueryResult {
    constructor(
        public readonly userID: number,
        public readonly questionTotal: string[],
        public readonly createdAt: string
    ) { }
}