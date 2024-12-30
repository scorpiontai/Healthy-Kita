export class askQuery {
    constructor(
        public readonly userID: number,
        public readonly question: any,
        public readonly answer: string,
        public readonly timestamp: Date,
    ) { }
}