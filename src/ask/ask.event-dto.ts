export class IntroAskEvent {
    constructor(
        public readonly userID: number,
        public readonly question: string[],
        public readonly answer: string[]
    ) { }
}