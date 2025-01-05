export class startAuditEvent {
    constructor(
        public readonly userIDEnc: string,
        public readonly timeStamp: string,
        public readonly fullName: string,
        public readonly tall: number,
        public readonly age: number,
        public readonly weight: number,
        public readonly intensActivity: number
    ) { }
}