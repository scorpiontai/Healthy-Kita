export class AuditEvent {
    constructor(
        public readonly userID: number,
        public readonly timestamp: Date,
        public readonly keyEnc: any,
        public readonly ivEnc: any
    ) { }
}