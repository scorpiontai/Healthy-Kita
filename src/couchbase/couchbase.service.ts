import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import * as couchbase from 'couchbase'
import { EncService } from 'src/enc/enc.service';
import { TimeService } from 'src/time/time.service';
@Injectable()
export class CouchbBaseService {
    constructor(@Inject("couchbase") private readonly couchbase,
        private readonly encService: EncService,
        private readonly timeServ: TimeService) { }
    async upset(userID: any, bucketName: string, upsertName: string, content: any, key?: [number], iv?: [number]): Promise<any> {
        try {
            let message = key && iv ? await this.encService.enc(key, iv, content) : content


            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()


            await coll.upsert(`${upsertName}`, message)
            return true

        } catch (err) {
            console.error(err.message);
        }
    }


    async get(bucketName: string, upsertName?: string): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            const get = upsertName ? coll.get(upsertName) : coll.get()

            return get
        } catch (err) {
                return false
        }
    }


    async update(bucketName: string, upsertName: string, content: JSON): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            coll.replace(upsertName, content)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }


    async del(bucketName: string, upsertName: string): Promise<any> {
        try {
            const bucket = this.couchbase.bucket(bucketName)
            const coll = bucket.defaultCollection()
            coll.remove(upsertName)
            return true
        } catch (err) {
            console.error("couchbase error", err.message);
        }
    }

}
