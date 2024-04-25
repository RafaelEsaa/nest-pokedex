import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, isValidObjectId } from 'mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {

    // console.log("enviroment", process.env.DEFAULT_LIMIT) // from .env
    this.defaultLimit = configService.get<number>("defaultLimit") // from config.env in pokemon.module
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(term: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = term
    return this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if(!isNaN(+term)){ //si term no es un numero
      pokemon = await this.pokemonModel.findOne({ no: term})
    }
    
    //Mongo id
    if(isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }
    
    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }
    
    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${term} not found`)
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id)
    // await pokemon.deleteOne();
    // return {id}

    // const pokemon = this.pokemonModel.findByIdAndDelete(id)
    // return pokemon

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if(!deletedCount){ // es cero
      throw new BadRequestException(`Pokemon with id ${id} not found`)
    }
    return
  }

  private handleExceptions(error: any) {
    console.log(error)
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
      }
      throw new InternalServerErrorException(`Can't create pokemon - Check server logs`)
  }
}
