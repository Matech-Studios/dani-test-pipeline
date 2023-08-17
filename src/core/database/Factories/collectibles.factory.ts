import { Factory, Faker } from '@mikro-orm/seeder';
import { CollectibleDto } from 'src/core/dto/collectible.dto';

export class CollectibleDtoFactory extends Factory<CollectibleDto> {
    model = CollectibleDto;

    definition(faker: Faker): Partial<CollectibleDto> {
        return {
            name: faker.name.firstName(),
            description: faker.commerce.productDescription(),
            website: `http://${faker.internet.domainName()}`,
            createdAt: Number(faker.random.numeric(8)),
            updatedAt: Number(faker.random.numeric(8))
        };
    }
}
