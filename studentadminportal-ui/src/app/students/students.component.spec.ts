import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppModule } from '../app.module';
import { Students } from '../models/api-models/ui-models/student-ui-model';
import { StudentService } from './student.service';
import { StudentsComponent } from './students.component';

const createStudent = (overrides: Partial<Students> = {}): Students => ({
  studentId: 'student-1',
  studentFirstName: 'Alex',
  studentLastname: 'Johnson',
  mobile: 1234567890,
  email: 'alex@example.com',
  dob: '2000-01-02',
  profileImageUrl: '',
  genderId: 'gender-1',
  gender: { genderId: 'gender-1', name: 'Female' },
  address: { addressId: 'address-1', streetAdress: '10 Main St', zipCode: '12345' },
  ...overrides
});

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let getStudents: Mock<() => Observable<Students[]>>;

  beforeEach(async () => {
    getStudents = vi.fn(() => of([]));

    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        { provide: StudentService, useValue: { getStudents } }
      ]
    })
    .compileComponents();

  });

  const render = () => {
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    render();
    expect(component).toBeTruthy();
  });

  it('loads and renders student rows and connects table pagination and sorting', () => {
    const students = [
      createStudent(),
      createStudent({
        studentId: 'student-2',
        studentFirstName: 'Morgan',
        studentLastname: 'Lee',
        email: 'morgan@example.com'
      })
    ];
    getStudents.mockReturnValue(of(students));

    render();

    expect(getStudents).toHaveBeenCalledOnce();
    expect(component.students).toEqual(students);
    expect(component.dataSource.paginator).toBe(component.matPaginator);
    expect(component.dataSource.sort).toBe(component.matSort);
    expect(fixture.nativeElement.textContent).toContain('Alex');
    expect(fixture.nativeElement.textContent).toContain('morgan@example.com');
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')).toHaveLength(2);
  });

  it('renders an empty table when the API returns no students', () => {
    render();
    expect(component.students).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Students');
  });

  it('filters students case-insensitively and ignores surrounding whitespace', () => {
    getStudents.mockReturnValue(of([
      createStudent(),
      createStudent({
        studentId: 'student-2',
        studentFirstName: 'Morgan',
        studentLastname: 'Lee',
        email: 'morgan@example.com'
      })
    ]));
    render();

    const search = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    search.value = '  ALEX@EXAMPLE.COM  ';
    search.dispatchEvent(new Event('input'));
    search.dispatchEvent(new KeyboardEvent('keyup'));
    fixture.detectChanges();

    expect(component.dataSource.filteredData.map(student => student.studentId)).toEqual(['student-1']);
    expect(fixture.nativeElement.textContent).toContain('Alex');
    expect(fixture.nativeElement.textContent).not.toContain('Morgan');
  });

  it('restores all rows when the filter is cleared', () => {
    render();
    component.dataSource.data = [createStudent(), createStudent({ studentId: 'student-2' })];
    component.filterString = 'no match';
    component.filterStudents();
    expect(component.dataSource.filteredData).toHaveLength(0);

    component.filterString = '  ';
    component.filterStudents();

    expect(component.dataSource.filteredData).toHaveLength(2);
  });

  it('logs API errors and leaves the list empty', () => {
    const failure = new Error('network unavailable');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    getStudents.mockReturnValue(throwError(() => failure));

    render();

    expect(log).toHaveBeenCalledWith(failure);
    expect(component.students).toEqual([]);
  });
});
