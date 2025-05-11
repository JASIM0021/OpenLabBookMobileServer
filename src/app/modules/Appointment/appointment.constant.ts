export const appointmentSearchableFields: string[] = [
  'status',
  'paymentStatus',
];

export const appointmentFilterableFields: string[] = [
  'searchTerm',
  'status',
  'paymentStatus',
  'patientEmail',
  // 'doctorEmail',
];

export const appointmentRelationalFields: string[] = [
  'patientEmail',
  'doctorEmail',
];

export const appointmentRelationalFieldsMapper: { [key: string]: string } = {
  patientEmail: 'patient',
  doctorEmail: 'doctor',
};

export type TAppointmentStatus =
  | 'SCHEDULED'
  | 'INPROGRESS'
  | 'COMPLETED'
  | 'CANCELED';
export const appointmentStatus: string[] = [
  'SCHEDULED',
  'INPROGRESS',
  'COMPLETED',
  'CANCELED',
];
export const appointmentPayment: string[] = ['UNPAID', 'PAID'];
export const paymentType: string[] = ['CASH', 'CARD'];
