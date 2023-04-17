import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gender } from '../models/api-models/api-models/gender-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  private baseUrl = 'http://localhost:7255/api/Gender'

  constructor(private httpClient: HttpClient) { }


  getGender() : Observable<Gender[]>{
    return this.httpClient.get<Gender[]>(this.baseUrl+'/GetGenders')
  }
}
