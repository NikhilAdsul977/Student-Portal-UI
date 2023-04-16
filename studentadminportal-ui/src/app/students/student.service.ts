import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Students } from '../models/api-models/api-models/student-model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = 'http://localhost:7255/api/'

  constructor(private httpClient: HttpClient) { }

  getStudent() : Observable<Students[]>{
    return this.httpClient.get<Students[]>(this.baseUrl+'Students/GetAllStudent')
  }
}
