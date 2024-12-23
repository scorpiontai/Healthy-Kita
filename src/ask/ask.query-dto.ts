export class askQuery {
    constructor(
        public readonly userID: number,
        public readonly question: string[],
        public readonly message: string[],
        public readonly timestamp: Date
    ) { }
}