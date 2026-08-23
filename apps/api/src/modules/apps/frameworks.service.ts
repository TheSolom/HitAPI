import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import type { NullableType } from '@hitapi/types';
import { Framework } from './entities/framework.entity.js';
import type { IFrameworksService } from './interfaces/frameworks-service.interface.js';
import type { CreateFrameworkDto } from './dto/create-framework.dto.js';
import type { UpdateFrameworkDto } from './dto/update-framework.dto.js';

@Injectable()
export class FrameworksService implements IFrameworksService {
    constructor(
        @InjectRepository(Framework)
        private readonly frameworksRepository: Repository<Framework>,
    ) {}

    async findAll(): Promise<Framework[]> {
        return this.frameworksRepository.find({
            order: { id: 'ASC' },
        });
    }

    async findById(id: number): Promise<NullableType<Framework>> {
        return this.frameworksRepository.findOneBy({ id });
    }

    async findByName(name: string): Promise<NullableType<Framework>> {
        return this.frameworksRepository.findOneBy({ name });
    }

    async create(createFrameworkDto: CreateFrameworkDto): Promise<Framework> {
        const existing = await this.findByName(createFrameworkDto.name);
        if (existing) {
            throw new ConflictException(
                'Framework with this name already exists',
            );
        }

        const framework = this.frameworksRepository.create({
            name: createFrameworkDto.name,
        });

        return this.frameworksRepository.save(framework);
    }

    async update(
        id: number,
        updateFrameworkDto: UpdateFrameworkDto,
    ): Promise<Framework> {
        const framework = await this.findById(id);
        if (!framework) {
            throw new NotFoundException('Framework not found');
        }

        if (
            updateFrameworkDto.name &&
            updateFrameworkDto.name !== framework.name
        ) {
            const existing = await this.frameworksRepository.findOne({
                where: {
                    name: updateFrameworkDto.name,
                    id: Not(id),
                },
            });

            if (existing) {
                throw new ConflictException(
                    'Framework with this name already exists',
                );
            }

            framework.name = updateFrameworkDto.name;
        }

        return this.frameworksRepository.save(framework);
    }

    async delete(id: number): Promise<void> {
        const framework = await this.findById(id);
        if (!framework) {
            throw new NotFoundException('Framework not found');
        }

        await this.frameworksRepository.remove(framework);
    }
}
