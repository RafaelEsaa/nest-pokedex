import axios from 'axios'
import { Model } from 'mongoose';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executedSeed() {
    // await this.pokemonModel.deleteMany({}); //Borramos toda la tabla
    // const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    // const insertPromisesArray = [];
    // data.results.forEach(async({ name, url}) => {
    //   const segments = url.split('/');
    //   const no = +segments[segments.length - 2];

    //   insertPromisesArray.push(this.pokemonModel.create({ name, no })); //Guardamos las promesas para luego utilizarlas
    // });

    // await Promise.all(insertPromisesArray); //Insertamos de manera simultanea

    // return "Seed executed";
    
    await this.pokemonModel.deleteMany({}); //Borramos toda la tabla
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    const pokemonToInsert: { name: string, no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no }); //Guardamos array con cada pokemon
    });

    await this.pokemonModel.insertMany(pokemonToInsert); //Insertamos array de pokemos

    return "Seed executed";
  }
}
