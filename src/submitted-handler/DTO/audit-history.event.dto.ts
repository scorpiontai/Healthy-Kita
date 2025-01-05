export class AuditHisotryEvent {
    constructor(
        public readonly calculationUserID: number,
        public readonly calculationMessage:any
    ) { }
}