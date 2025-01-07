export class NotificationsEvent {
    constructor(
        public readonly userID: number,
        public readonly message: string,
        public readonly time: any
    ) { }
}