import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Students } from '../models/api-models/api-models/student-model';
import { StudentService } from './student.service';

const student: Students = {
  studentId: 'student-1',
  studentFirstName: 'Alex',
  studentLastname: 'Johnson',
  mobile: 1234567890,
  email: 'alex@example.com',
  dob: '2000-01-02',
  profileImageUrl: '',
  genderId: 'gender-1',
  gender: { genderId: 'gender-1', name: 'Female' },
  address: { addressId: 'address-1', streetAdress: '10 Main St', zipCode: '12345' }
};

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('requests the complete student list', () => {
    let response: Students[] | undefined;

    service.getStudents().subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/GetAllStudent');

    expect(request.request.method).toBe('GET');
    request.flush([student]);
    expect(response).toEqual([student]);
  });

  it('requests a student by id', () => {
    let response: Students | undefined;

    service.getStudent('student-1').subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/GetStudentById/student-1');

    expect(request.request.method).toBe('GET');
    request.flush(student);
    expect(response).toEqual(student);
  });

  it('flattens address fields into the update request body', () => {
    let response: Students | undefined;

    service.updateStudent('student-1', student).subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/UpdateStudent/student-1');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      studentFirstName: 'Alex',
      studentLastname: 'Johnson',
      dob: '2000-01-02',
      mobile: 1234567890,
      email: 'alex@example.com',
      genderId: 'gender-1',
      streetAdress: '10 Main St',
      zipCode: '12345'
    });
    request.flush(student);
    expect(response).toEqual(student);
  });

  it('flattens address and gender fields into the add request body', () => {
    let response: Students | undefined;

    service.addStudent(student).subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/AddStudent');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      studentFirstName: 'Alex',
      studentLastname: 'Johnson',
      dob: '2000-01-02',
      mobile: 1234567890,
      email: 'alex@example.com',
      genderId: 'gender-1',
      streetAdress: '10 Main St',
      zipCode: '12345'
    });
    request.flush(student);
    expect(response).toEqual(student);
  });

  it('deletes a student by id', () => {
    let completed = false;

    service.deleteSudent('student-1').subscribe(() => completed = true);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/DeleteStudent/student-1');

    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(completed).toBe(true);
  });

  it('sends the selected profile image as multipart form data', () => {
    const file = new File(['profile image'], 'profile.png', { type: 'image/png' });
    let response: string | undefined;

    service.uploadImage('student-1', file).subscribe(value => response = value);
    const request = httpTestingController.expectOne('http://localhost:7255/api/Students/UploadProfile/student-1');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('profileImage')).toBe(file);
    request.flush('uploads/profile.png');
    expect(response).toBe('uploads/profile.png');
  });

  it('resolves relative image paths against the API base URI', () => {
    expect(service.getImagePath('uploads/profile.png')).toBe(
      'http://localhost:7255/uploads/profile.png'
    );
  });

  it('provides an injectable service', () => {
    expect(service).toBeTruthy();
  });
});
