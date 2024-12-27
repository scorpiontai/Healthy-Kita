import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import * as couchbase from 'couchbase'
import { EncService } from 'src/enc/enc.service';
@Injectable()
export class CouchbBaseService {
    constructor(@Inject("couchbase") private readonly couchbase,
        private readonly encService: EncService) { }
    async upset(bucketName: string, upsertName: string, content: any, key: any, iv: any): Promise<any> {
        try {
            //before is encryption
            let arrContent = []
            const { message, timestamp } = content
            const encText = await this.encService.enc(key, iv, message)

            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()

            //before is get
            await coll.upsert(upsertName, { message: message, timestamp: timestamp, sort: "first" })
            const getData = await this.get("AI", upsertName)

            arrContent.push(getData.content, { message: message, timestamp: timestamp, sort: 'first' })
            await coll.upsert(upsertName, { arrContent })
            return "success to upsert"
        } catch (err) {
            console.error(err.message);
        }
    }
    async get(bucketName: string, upsertName?: string): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            return upsertName !== null ? coll.get(upsertName) : coll.get()
        } catch (err) {
            console.error(err.message);
        }
    }
    async update(bucketName: string, upsertName: string, content: JSON): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            coll.replace(upsertName, content)
            return "success to replace"
        } catch (err) {
            console.error(err.message);
        }
    }
    async del(bucketName: string, upsertName: string): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            coll.remove(upsertName)
            return 'success to remove'
        } catch (err) {
            console.error(err.message);
        }
    }

}
