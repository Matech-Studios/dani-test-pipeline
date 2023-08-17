import { Factory, Faker } from '@mikro-orm/seeder';
import { EventDto } from 'src/core/dto/event.dto';

export class EventDtoFactory extends Factory<EventDto> {
    model = EventDto;

    definition(faker: Faker): Partial<EventDto> {
        return {
            name: faker.name.firstName(),
            description: faker.commerce.productDescription(),
            city: faker.address.streetAddress(),
            country: faker.address.country(),
            startDate: Number(faker.random.numeric(10)),
            endDate: Number(faker.random.numeric(10)),
            multiDay: false,
            virtual: false,
            poapsQuantity: Number(faker.random.numeric(2)),
            createdBy: faker.name.firstName(),
            updatedBy: faker.name.firstName(),
            createdAt: Number(faker.random.numeric(8)),
            updatedAt: Number(faker.random.numeric(8))
        };
    }
}
