
export class CommentarUsers {
    constructor(
        public readonly uuidPost: string,
        public readonly content: string,
        public readonly userID: any
    ) { }
}   