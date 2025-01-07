import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class GeneralMutationSchema {
    @Field(() => ID)
    uuid: string

    @Field()
    title: string

    @Field()
    description: string

    @Field()
    commentAllow: number

    @Field()
    publish: number

    @Field()
    url: string


    @Field()
    status: number

    @Field()
    message: string
}