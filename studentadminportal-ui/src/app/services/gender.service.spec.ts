import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GenderService } from './gender.service';

describe('GenderService', () => {
  let service: GenderService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GenderService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('requests the gender options from the API', () => {
    const genders = [{ genderId: 'gender-1', name: 'Female' }];
    let response: typeof genders | undefined;

    service.getGender().subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Gender/GetGenders');

    expect(request.request.method).toBe('GET');
    request.flush(genders);
    expect(response).toEqual(genders);
  });

  it('returns an empty gender list when the API has no options', () => {
    let response: unknown;

    service.getGender().subscribe(value => response = value);
    httpTestingController.expectOne('http://localhost:7255/api/Gender/GetGenders').flush([]);

    expect(response).toEqual([]);
  });

  it('provides an injectable service', () => {
    expect(service).toBeTruthy();
  });
});
