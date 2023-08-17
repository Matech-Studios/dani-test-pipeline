import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { CollectibleRaffleDto } from 'src/core/dto/collectibleRaffle.dto';
import { EventDto } from 'src/core/dto/event.dto';
import { MintLinkDto } from 'src/core/dto/mintLink.dto';
import { PrizeDto } from 'src/core/dto/prize.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { CollectibleDtoFactory } from '../Factories/collectibles.factory';
import { EventDtoFactory } from '../Factories/events.factory';
import { CompanyDto } from './../../dto/company.dto';
import { UserDto } from './../../dto/user.dto';

export class TestSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        let company;
        company = await em.findOne(CompanyDto, { name: 'The company' });

        if (!company) {
            company = em.create(CompanyDto, {
                name: 'The company'
            });
        }
        let user = await em.findOne(UserDto, { externalUserId: '123' });
        if (!user) {
            user = em.create(UserDto, {
                externalUserId: '123',
                name: 'John',
                lastName: 'Rambo',
                email: 'john@rambo.com',
                company: company,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        new EventDtoFactory(em).create(2, {
            companyId: company,
            createdBy: user.id,
            updatedBy: user.id
        });

        const events = await em.find(EventDto, {});
        // const events = await em.find(EventDto, {})[0];

        new CollectibleDtoFactory(em).create(3, {
            attendees: 50,
            event: events[0],
            createdBy: user.id,
            updatedBy: user.id
        });

        // create raffle

        const raffle = em.create(RaffleDto, {
            name: 'First Raffle',
            event: events[0].id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.id,
            useWeight: true,
            key: 123
        });
        const raffles = await em.find(RaffleDto, {});

        em.create(PrizeDto, {
            order: 1,
            details: 'first prize',
            quantity: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.id,
            raffle: raffles[0]
        });

        em.create(PrizeDto, {
            order: 2,
            details: 'second prize',
            quantity: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.id,

            raffle: raffles[0]
        });

        em.create(PrizeDto, {
            order: 3,
            details: 'third prize',
            quantity: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.id,
            raffle: raffles[0]
        });

        const collectibles = await em.find(CollectibleDto, {});

        em.create(CollectibleRaffleDto, {
            collectibleId: collectibles[0].id,
            raffleId: raffles[0].id,
            score: 60,
            createdBy: user.id,
            createdAt: 1234
        });

        em.create(CollectibleRaffleDto, {
            collectibleId: collectibles[1].id,
            raffleId: raffles[0].id,
            score: 10,
            createdBy: user.id,
            createdAt: 1234
        });
        em.create(CollectibleRaffleDto, {
            collectibleId: collectibles[2].id,
            raffleId: raffles[0].id,
            score: null,
            createdBy: user.id,
            createdAt: 1234
        });

        em.create(MintLinkDto, {
            claimed: true,
            qrHash: 'abcd',
            collectible: collectibles[0],
            createdBy: user.id,
            createdAt: 1234,
            beneficiary: 'beneficiary x60'
        });

        em.create(MintLinkDto, {
            claimed: true,
            qrHash: 'abcde',
            collectible: collectibles[1],
            createdBy: user.id,
            createdAt: 1234,
            beneficiary: 'beneficiary x10'
        });

        em.create(MintLinkDto, {
            claimed: true,
            qrHash: 'abcdef',
            collectible: collectibles[2],
            createdBy: user.id,
            createdAt: 1234,
            beneficiary: 'beneficiary x 1'
        });

        em.create(MintLinkDto, {
            claimed: false,
            qrHash: 'abcdefg',
            collectible: collectibles[2],
            createdBy: user.id,
            createdAt: 1234,
            beneficiary: '[ Should Not Appear - Unclaimed Token ] - beneficiary x 0'
        });
    }
}
