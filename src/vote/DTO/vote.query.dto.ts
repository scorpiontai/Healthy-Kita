
export class VoteRead {
    constructor(
        public readonly userID: number,
        public readonly limit: number
    ) { }
}