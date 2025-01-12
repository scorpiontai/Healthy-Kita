import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { addExternalInfo } from "../DTO/addExternalPublish.share.dto";
import { AischemaService } from "src/mongoose/aischema/aischema.service";

@CommandHandler(addExternalInfo)
export class addExternalInfoCommand implements ICommandHandler<addExternalInfo> {
    constructor(
        private readonly aischemaServ: AischemaService,

    ) { }

    async checkForUrlExists(url: string): Promise<any> {
        try {
            const find = await this.aischemaServ.findUrlName(url)
            console.debug("find", find)
            return find
        } catch (err) {
            console.error(err.message);
        }
    }

    async execute(command: addExternalInfo): Promise<any> {
        let { uuid, published, commentAllow, title, description, url } = command
        try {
            published = published === 1 ? published : 0
            commentAllow = commentAllow === 1 ? commentAllow : 0
            title = title === 'q' ? new Date().toLocaleString() : title
            description = description === 'q' ? null : description
            url = url === 'q' ? uuid : url.replace(/\s+/g, '-')


            const findUUID = await this.aischemaServ.findOneByUUID(uuid)

            if (await this.checkForUrlExists(url)) {
                return { status: false, message: `sudah ada url ${url}. Harap gunakan yang lain` }
            }

            if (!await this.aischemaServ.findOneByUUID(uuid)) {
                const action = await this.aischemaServ.addExternalInfo(
                    uuid, published, commentAllow,
                    title, description, url)
                return {status: action, message: `anda sudah memposting sesuatu`}
            } else {
                return {status: false, message:`berhasil!`}
            }
        } catch (error) {
            console.error("add external error", error.message)
        }

    }
}