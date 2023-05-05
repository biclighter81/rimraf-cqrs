import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
    @Query(() => String)
    async healthCheck() {
        return 'OK';
    }
}