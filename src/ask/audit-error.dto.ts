export class auditError {
    constructor(
        public readonly userID: number,
        public readonly message: string
    ) { }
}