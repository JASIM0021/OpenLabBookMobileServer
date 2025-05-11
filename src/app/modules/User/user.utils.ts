import { Organization } from '../Organization/organization.model';
import { User } from './user.model';

// Faculty ID
export const findLastFacultyId = async () => {
  const lastFaculty = await User.findOne(
    {
      role: 'faculty',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastFaculty?.id ? lastFaculty.id.substring(2) : undefined;
};

export const generateFacultyId = async () => {
  let currentId = (0).toString();
  const lastFacultyId = await findLastFacultyId();

  if (lastFacultyId) {
    currentId = lastFacultyId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

  incrementId = `F-${incrementId}`;

  return incrementId;
};

// Admin ID
export const findLastAdminId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'admin',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastAdmin?.id ? lastAdmin.id.substring(2) : undefined;
};

export const generateAdminId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastAdminId();

  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

  incrementId = `A-${incrementId}`;
  return incrementId;
};

// Patient ID
export const findLastPatientId = async () => {
  const lastPatient = await User.findOne(
    {
      role: 'patient',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastPatient?.id ? lastPatient.id.substring(2) : undefined;
};

export const generatePatientId = async () => {
  const randomId = Math.floor(1000 + Math.random() * 9000)
    .toString()
    .padStart(4, '0');
  
  return `P-${randomId}`;
};

// Patient ID
export const findLastOrganizationCode = async () => {
  const lastPatient = await Organization.findOne(
    {},
    {
      organizationCode: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastPatient?.organizationCode
    ? lastPatient.organizationCode.substring(2)
    : undefined;
};

export const generateOrganizationCode = async () => {
  let currentId = (0).toString();
  const lastPatientId = await findLastOrganizationCode();

  if (lastPatientId) {
    currentId = lastPatientId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

  incrementId = `O-${incrementId}`;
  return incrementId;
};

export const generateOtp = (): string => {
  // Generate a random integer between 1000 and 9999
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Return the OTP as a string with leading zeros if necessary
  return otp.toString();
};
