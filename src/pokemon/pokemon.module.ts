import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [
    ConfigModule,
    // Config modelo BD en el modulo
    MongooseModule.forFeature([
      {
        name: Pokemon.name, // Es el nombre del documento, no de la propiedad name en el entity
        schema: PokemonSchema,
      },
    ]),
  ],
  exports: [
    MongooseModule
  ]
})
export class PokemonModule {}
