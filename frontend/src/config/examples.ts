import type { ExampleSchemaItem } from '../types';

export const EXAMPLE_SCHEMAS: ExampleSchemaItem[] = [
  {
    id: '1nf-atomicity',
    title: 'STUDENT_COURSES (1NF Atomicity Demo)',
    target_topic: '1NF Violation',
    description: 'A student relation with non-atomic values in the Courses attribute to demonstrate 1NF unnesting.',
    schema: {
      name: 'STUDENT_COURSES',
      attributes: ['StudentID', 'StudentName', 'Courses', 'Major'],
      candidate_keys: [['StudentID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName', 'Major'] },
      ],
      multivalued_dependencies: [],
      sample_data: [
        { StudentID: 'S101', StudentName: 'Alex Rivera', Courses: 'DBMS, OS, CN', Major: 'Computer Science' },
        { StudentID: 'S102', StudentName: 'Maya Chen', Courses: 'Algorithms, Linear Algebra', Major: 'Data Science' },
        { StudentID: 'S103', StudentName: 'Samir Khan', Courses: 'Compilers', Major: 'Computer Science' },
      ],
    },
  },
  {
    id: '2nf-partial-dep',
    title: 'ENROLLMENT (Classic 2NF Partial Dependency)',
    target_topic: '2NF Violation',
    description: 'Composite primary key (StudentID, CourseID) with partial dependencies violating 2NF.',
    schema: {
      name: 'ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
        { id: 'fd-2', left: ['CourseID'], right: ['CourseName'] },
        { id: 'fd-3', left: ['StudentID', 'CourseID'], right: ['Grade'] },
      ],
      multivalued_dependencies: [],
      sample_data: [
        { StudentID: 'S1', CourseID: 'C1', StudentName: 'Alice', CourseName: 'Database Systems', Grade: 'A' },
        { StudentID: 'S1', CourseID: 'C2', StudentName: 'Alice', CourseName: 'Operating Systems', Grade: 'B+' },
        { StudentID: 'S2', CourseID: 'C1', StudentName: 'Bob', CourseName: 'Database Systems', Grade: 'A-' },
      ],
    },
  },
  {
    id: '3nf-transitive-dep',
    title: 'STAFF_BRANCH (Classic 3NF Transitive Dependency)',
    target_topic: '3NF Violation',
    description: 'Relation satisfying 2NF but containing a transitive dependency: StaffNo → BranchNo and BranchNo → BAddress.',
    schema: {
      name: 'STAFF_BRANCH',
      attributes: ['StaffNo', 'SName', 'Position', 'Salary', 'BranchNo', 'BAddress'],
      candidate_keys: [['StaffNo']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StaffNo'], right: ['SName', 'Position', 'Salary', 'BranchNo'] },
        { id: 'fd-2', left: ['BranchNo'], right: ['BAddress'] },
      ],
      multivalued_dependencies: [],
      sample_data: [
        { StaffNo: 'SL21', SName: 'John White', Position: 'Manager', Salary: 30000, BranchNo: 'B005', BAddress: '22 Deer Rd' },
        { StaffNo: 'SG37', SName: 'Ann Beech', Position: 'Senior Assistant', Salary: 18000, BranchNo: 'B003', BAddress: '163 Main St' },
        { StaffNo: 'SG14', SName: 'David Ford', Position: 'Deputy', Salary: 24000, BranchNo: 'B003', BAddress: '163 Main St' },
      ],
    },
  },
  {
    id: '4nf-mvd',
    title: 'RESTAURANT_DELIVERY (Classic 4NF Multivalued Dependency)',
    target_topic: '4NF Violation',
    description: 'Relation with independent multivalued facts: Restaurant ↠ PizzaVariety and Restaurant ↠ DeliveryArea.',
    schema: {
      name: 'RESTAURANT_DELIVERY',
      attributes: ['Restaurant', 'PizzaVariety', 'DeliveryArea'],
      candidate_keys: [['Restaurant', 'PizzaVariety', 'DeliveryArea']],
      functional_dependencies: [],
      multivalued_dependencies: [
        { id: 'mvd-1', left: ['Restaurant'], right: ['PizzaVariety'] },
        { id: 'mvd-2', left: ['Restaurant'], right: ['DeliveryArea'] },
      ],
      sample_data: [
        { Restaurant: 'Pizza Plaza', PizzaVariety: 'Margherita', DeliveryArea: 'North Campus' },
        { Restaurant: 'Pizza Plaza', PizzaVariety: 'Margherita', DeliveryArea: 'South Campus' },
        { Restaurant: 'Pizza Plaza', PizzaVariety: 'Pepperoni', DeliveryArea: 'North Campus' },
        { Restaurant: 'Pizza Plaza', PizzaVariety: 'Pepperoni', DeliveryArea: 'South Campus' },
      ],
    },
  },
  {
    id: 'normalized-schema',
    title: 'COURSE_FACULTY (Normalized 3NF/4NF Schema)',
    target_topic: 'Fully Normalized',
    description: 'A clean relational schema already in 3NF and 4NF where all non-trivial determinants are superkeys.',
    schema: {
      name: 'COURSE_FACULTY',
      attributes: ['CourseCode', 'SectionID', 'FacultyID', 'RoomNumber', 'Semester'],
      candidate_keys: [['CourseCode', 'SectionID', 'Semester']],
      functional_dependencies: [
        { id: 'fd-1', left: ['CourseCode', 'SectionID', 'Semester'], right: ['FacultyID', 'RoomNumber'] },
      ],
      multivalued_dependencies: [],
      sample_data: [
        { CourseCode: 'CS201', SectionID: 'SEC-A', FacultyID: 'FAC-10', RoomNumber: 'LH-101', Semester: 'Fall 2026' },
        { CourseCode: 'CS201', SectionID: 'SEC-B', FacultyID: 'FAC-12', RoomNumber: 'LH-102', Semester: 'Fall 2026' },
      ],
    },
  },
];
