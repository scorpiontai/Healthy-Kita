export class Vote {
    constructor(
        public readonly commentId: string,
        public readonly condition: number,
        public readonly userID: number
    ) { }
}