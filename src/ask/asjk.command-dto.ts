export class askCommandDTO {
    constructor(
        public readonly userID: number,
        public readonly question: string[],
        public readonly answer: string[],
        public readonly timestamp: Date
    ) { }
}