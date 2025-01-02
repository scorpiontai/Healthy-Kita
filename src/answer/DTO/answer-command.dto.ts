export class AnswerCommand {
    constructor(
        public readonly userID: any,
        public readonly range: any,
        public readonly encKey: [number],
        public readonly ivKey: [number]
    ) { }
}