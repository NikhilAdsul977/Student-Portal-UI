import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { Gender } from '../../models/api-models/ui-models/gender-ui-model';
import { Students } from '../../models/api-models/ui-models/student-ui-model';
import { AppModule } from '../../app.module';
import { GenderService } from '../../services/gender.service';
import { StudentService } from '../student.service';
import { ViewStudentComponent } from './view-student.component';

const studentRecord = (overrides: Partial<Students> = {}): Students => ({
  studentId: 'student-1',
  studentFirstName: 'Alex',
  studentLastname: 'Johnson',
  mobile: 1234567890,
  email: 'alex@example.com',
  dob: '2000-01-02',
  profileImageUrl: 'uploads/alex.png',
  genderId: 'gender-1',
  gender: { genderId: 'gender-1', name: 'Female' },
  address: { addressId: 'address-1', streetAdress: '10 Main St', zipCode: '12345' },
  ...overrides
});

describe('ViewStudentComponent', () => {
  let component: ViewStudentComponent;
  let fixture: ComponentFixture<ViewStudentComponent>;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let getStudent: Mock<(id: string) => Observable<Students>>;
  let getGender: Mock<() => Observable<Gender[]>>;
  let addStudent: Mock<(student: Students) => Observable<Students>>;
  let updateStudent: Mock<(id: string, student: Students) => Observable<Students>>;
  let deleteStudent: Mock<(id: string) => Observable<void>>;
  let uploadImage: Mock<(id: string, file: File) => Observable<string>>;
  let getImagePath: Mock<(path: string) => string>;
  let openSnackbar: Mock;
  let router: Router;

  const render = async (id: string | null = 'Add') => {
    routeParams.next(convertToParamMap(id === null ? {} : { id }));
    fixture = TestBed.createComponent(ViewStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const makeFormValid = async () => {
    component.student = studentRecord({ dob: '2000-01-02T00:00:00.000Z' });
    fixture.detectChanges();
    const form = component.studentDetailsForm?.form;
    form?.get('studentFirstName')?.setValue('Alex');
    form?.get('studentLastname')?.setValue('Johnson');
    form?.get('dob')?.setValue(new Date('2000-01-02T00:00:00.000Z'));
    form?.get('email')?.setValue('alex@example.com');
    form?.get('mobile')?.setValue(1234567890);
    form?.get('gender')?.setValue('gender-1');
    form?.get('streetAdress')?.setValue('10 Main St');
    form?.get('zipCode')?.setValue('12345');
    const invalidControls = Object.fromEntries(
      Object.entries(form?.controls ?? {})
        .filter(([, control]) => control.invalid)
        .map(([name, control]) => [name, control.errors])
    );
    expect(form?.valid, JSON.stringify(invalidControls)).toBe(true);
  };

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: 'Add' }));
    getStudent = vi.fn(() => of(studentRecord()));
    getGender = vi.fn(() => of([{ genderId: 'gender-1', name: 'Female' }]));
    addStudent = vi.fn(student => of(student));
    updateStudent = vi.fn((_id, student) => of(student));
    deleteStudent = vi.fn(() => of(undefined));
    uploadImage = vi.fn(() => of('uploads/new-profile.png'));
    getImagePath = vi.fn(path => `http://localhost:7255/${path}`);
    openSnackbar = vi.fn();

    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: routeParams.asObservable() } },
        {
          provide: GenderService,
          useValue: { getGender }
        },
        {
          provide: StudentService,
          useValue: { getStudent, addStudent, updateStudent, deleteSudent: deleteStudent, uploadImage, getImagePath }
        },
        { provide: MatSnackBar, useValue: { open: openSnackbar } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts in add mode with a fallback profile image and required gender options', async () => {
    await render('Add');

    expect(component.isNewStudent).toBe(true);
    expect(component.header).toBe('Add New Student');
    expect(component.displayProfileImageUrl).toBe('assets/user1.webp');
    expect(component.genderList).toEqual([{ genderId: 'gender-1', name: 'Female' }]);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Add New Student');
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.some(button => button.textContent?.includes('Add'))).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Change Image');
  });

  it('loads an existing student and displays the profile image from the API', async () => {
    await render('student-1');

    expect(getStudent).toHaveBeenCalledWith('student-1');
    expect(component.isNewStudent).toBe(false);
    expect(component.header).toBe('Edit Students');
    expect(component.student.studentFirstName).toBe('Alex');
    expect(component.displayProfileImageUrl).toBe('http://localhost:7255/uploads/alex.png');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe(
      'http://localhost:7255/uploads/alex.png'
    );
    expect(fixture.nativeElement.textContent).toContain('Change Image');
  });

  it('recognizes the add route without case sensitivity', async () => {
    await render('aDd');

    expect(component.isNewStudent).toBe(true);
    expect(getStudent).not.toHaveBeenCalled();
  });

  it('uses the fallback image when loading an existing student fails', async () => {
    getStudent.mockReturnValue(throwError(() => new Error('network unavailable')));

    await render('student-1');

    expect(component.displayProfileImageUrl).toBe('assets/user1.webp');
    expect(component.student.studentId).toBe('');
  });

  it('does not fetch a student when the route has no id', async () => {
    await render(null);

    expect(getStudent).not.toHaveBeenCalled();
    expect(component.isNewStudent).toBe(false);
  });

  it('keeps the add action disabled by form validity when required values are missing', async () => {
    await render('Add');
    expect(component.studentDetailsForm?.form.valid).toBe(false);
    const addButton = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find(button => button.textContent?.includes('Add'));
    expect(addButton).toBeDefined();
    expect(addButton?.disabled).toBe(true);

    component.onAdd();

    expect(addStudent).not.toHaveBeenCalled();
  });

  it('adds a valid student, displays success, and navigates to the new record', async () => {
    await render('Add');
    await makeFormValid();
    const createdStudent = studentRecord({ studentId: 'student-new' });
    addStudent.mockReturnValue(of(createdStudent));
    vi.useFakeTimers();

    component.onAdd();
    await vi.advanceTimersByTimeAsync(2000);

    expect(addStudent).toHaveBeenCalledOnce();
    expect(addStudent.mock.calls[0]?.[0]).toMatchObject({
      studentFirstName: 'Alex',
      studentLastname: 'Johnson',
      email: 'alex@example.com'
    });
    expect(openSnackbar).toHaveBeenCalledWith('Student Added Successfully', undefined, { duration: 2000 });
    expect(router.navigateByUrl).toHaveBeenCalledWith('students/student-new');
    expect(component.isNewStudent).toBe(false);
  });

  it('reports a failed student add without navigating', async () => {
    await render('Add');
    await makeFormValid();
    addStudent.mockReturnValue(throwError(() => new Error('server error')));

    component.onAdd();

    expect(openSnackbar).toHaveBeenCalledWith('Student Add Failed', undefined, { duration: 2000 });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('updates a student and reports a successful response', async () => {
    await render('student-1');
    await makeFormValid();

    component.onUpdate();

    expect(updateStudent).toHaveBeenCalledWith('student-1', component.student);
    expect(openSnackbar).toHaveBeenCalledWith('Student Updated Successfully', undefined, { duration: 2000 });
  });

  it('reports a failed student update', async () => {
    await render('student-1');
    await makeFormValid();
    updateStudent.mockReturnValue(throwError(() => new Error('server error')));

    component.onUpdate();

    expect(openSnackbar).toHaveBeenCalledWith('Student Updated Failed', undefined, { duration: 2000 });
  });

  it('does not send an update while required form fields are invalid', async () => {
    await render('student-1');
    component.studentDetailsForm?.form.get('studentFirstName')?.setValue('');

    component.onUpdate();

    expect(updateStudent).not.toHaveBeenCalled();
  });

  it('deletes a student and navigates back to the list after the success message', async () => {
    await render('student-1');
    vi.useFakeTimers();

    component.onDelete();
    await vi.advanceTimersByTimeAsync(2000);

    expect(deleteStudent).toHaveBeenCalledWith('student-1');
    expect(openSnackbar).toHaveBeenCalledWith('Student Deleted Successfully', undefined, { duration: 2000 });
    expect(router.navigateByUrl).toHaveBeenCalledWith('students');
  });

  it('reports a failed delete and does not navigate', async () => {
    await render('student-1');
    deleteStudent.mockReturnValue(throwError(() => new Error('server error')));

    component.onDelete();

    expect(openSnackbar).toHaveBeenCalledWith('Student Delete Failed', undefined, { duration: 2000 });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('ignores an image upload when the form is invalid', async () => {
    await render('student-1');
    component.studentDetailsForm?.form.get('studentFirstName')?.setValue('');
    const file = new File(['image'], 'profile.png', { type: 'image/png' });

    component.uploadImage({ target: { files: [file] } } as unknown as Event);

    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('ignores a cancelled or empty image selection', async () => {
    await render('student-1');
    await makeFormValid();

    component.uploadImage({ target: { files: [] } } as unknown as Event);
    component.uploadImage({ target: { files: null } } as unknown as Event);

    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('uploads the selected image and updates the displayed image URL', async () => {
    await render('student-1');
    await makeFormValid();
    const file = new File(['image'], 'profile.png', { type: 'image/png' });

    component.uploadImage({ target: { files: [file] } } as unknown as Event);

    expect(uploadImage).toHaveBeenCalledWith('student-1', file);
    expect(component.student.profileImageUrl).toBe('uploads/new-profile.png');
    expect(component.displayProfileImageUrl).toBe('http://localhost:7255/uploads/new-profile.png');
    expect(openSnackbar).toHaveBeenCalledWith('Student image updated successfully', undefined, { duration: 2000 });
  });

  it('reports an image upload failure without changing the profile image', async () => {
    await render('student-1');
    makeFormValid();
    uploadImage.mockReturnValue(throwError(() => new Error('server error')));
    const file = new File(['image'], 'profile.png', { type: 'image/png' });

    component.uploadImage({ target: { files: [file] } } as unknown as Event);

    expect(component.student.profileImageUrl).toBe('uploads/alex.png');
    expect(component.displayProfileImageUrl).toBe('http://localhost:7255/uploads/alex.png');
    expect(openSnackbar).toHaveBeenCalledWith('Student image update Failed', undefined, { duration: 2000 });
  });
});
