export class askQueryResult {
    constructor(
        public readonly userID: number,
        public readonly questionTotal: string[],
        public readonly answerTotal: string[],
        public readonly conclusion: string,
        public readonly timestart: Date,
        public readonly timeend: Date,
        public readonly totaly: string
    ) { }
}