/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';

import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import {
  HtmltemplateForAdmin,
  HtmltemplateForService,
  sendEmail,
  sendSMS,
  sendWhatsApp,
  smsFormatBookAppointmentAdmin,
  smsFormatBookAppointmentClient,
  smsFormatHomeCareAdmin,
  smsFormatHomeCareClient,
  WA_AppoinmentAdmin,
  WA_AppoinmentClient,
  WA_DirectBookingSendAdmin,
  WA_DirectBookingSendClient,
  WA_HomeCareAdmin,
  WA_HomecareClient,
} from '../../utils/sendEmail';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Organization } from '../Organization/organization.model';
import { USER_ROLE } from '../User/user.constant';
import {
  appointmentFilterableFields,
  TAppointmentStatus,
} from './appointment.constant';
import { TAppointment } from './appointment.interface';
import { Appointment } from './appointment.model';
import { Cart } from '../cart/cart.model';
import { MedicalTest } from '../MedicalTest/medicaltest.model';
import { User } from '../User/user.model';
import { TUser } from '../User/user.interface';

const createAppointment = async (
  file: any,
  payload: TAppointment,
  userInfo: any,
) => {
  console.log('file', file);
  const isOrganizationExists = await Organization.findById(
    payload.organization,
  );
  console.log('isOrganizationExists', isOrganizationExists);
  const cart = await Cart.findOne({ user: userInfo._id });

  // const medicalTest = await MedicalTest.findById({
  //   testCode: payload.medicalTestLists[0].testCode,
  // }).populate('organization', 'organizationName');
  const medicalTest = await MedicalTest.findOne({
    testCode: payload.medicalTestLists[0].testCode,
  }).populate({
    path: 'organization',
    select: 'organizationName',
  });
  // console.log('medicalTest', medicalTest);
  if (!isOrganizationExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Organization doesn't exists!");
  }

  let secureUrl = null; // Variable to hold the secure URL
  if (file) {
    const imageName = `${userInfo.contactNumber}${isOrganizationExists.organizationCode}`;
    const path = file?.path;
    //send image to cloudinary
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    payload.prescriptionPhoto = secure_url as string;
    secureUrl = secure_url; // Set the secure URL
  }
  payload.patientId = userInfo?._id;
  payload.directAppointment = false;

  const newAppointment = await Appointment.create(payload);

  console.log('userInfo :>> ', userInfo);
  // Construct the HTML content for the email

  //   const smsClient = `Appointment Confirmed!
  // Thank you for booking. Our team will contact you soon to finalize the date and time.
  // Name: ${payload?.patientInfo?.name}
  // Test: ${payload.medicalTestLists[0].testName}
  // Amount: ${payload.medicalTestLists[0].mrp}
  // Location: ${payload.patientInfo.address ? payload?.patientInfo?.address : 'No Address Provided'}
  // Type: ${medicalTest?.services[0].serviceName}
  // Referred By: ${payload?.patientInfo?.referBy}
  // For queries or cancellations, contact: ${process.env.ADMIN_PHONE}
  // `;
  let smsClient = '';
  let smsAdmin = '';
  if (medicalTest?.services[0].serviceName.includes('Book Appoinment')) {
    smsClient = smsFormatBookAppointmentClient({
      name: payload?.patientInfo?.name,
      amount: `${payload.medicalTestLists[0].mrp}`,
      bookingType: `${medicalTest?.services[0].serviceName}`,
      test: payload.medicalTestLists[0].testName,
      location: payload.patientInfo.address
        ? payload?.patientInfo?.address
        : 'No Address Provided',
      referredBy: payload?.patientInfo?.referBy,
    });

    smsAdmin = smsFormatBookAppointmentAdmin({
      name: payload?.patientInfo?.name,
      amount: `${payload.medicalTestLists[0].mrp}`,
      test: payload.medicalTestLists[0].testName,

      referredBy: payload?.patientInfo?.referBy,
      contactNumber: payload.patientInfo.contactNumber,
      organizationName: medicalTest.organizationName,
      serviceName: medicalTest.services[0].serviceName,
    });
  } else {
    smsClient = smsFormatHomeCareClient({
      name: payload?.patientInfo?.name,
      amount: `${payload.medicalTestLists[0].mrp}`,
      test: payload.medicalTestLists[0].testName,
      address: payload.patientInfo.address,
    });
    smsAdmin = smsFormatHomeCareAdmin({
      name: payload?.patientInfo?.name,
      amount: `${payload.medicalTestLists[0].mrp}`,
      test: payload.medicalTestLists[0].testName,
      address: payload.patientInfo.address,
      contact: payload.patientInfo.contactNumber,
      organizationName: medicalTest?.organizationName,
    });
  }

  // smsAdmin = `${payload.patientInfo.name}, ${medicalTest?.organizationName}, ${payload.medicalTestLists[0].testName}, ₹${payload.medicalTestLists[0].mrp}, ${payload.patientInfo.contactNumber}, ${medicalTest?.services[0].serviceName},Referred By:${payload?.patientInfo?.referBy} `;

  const emailContentForPatient = HtmltemplateForService({
    user: payload.patientInfo.name,
    amount: `${payload?.medicalTestLists[0].mrp}`,
    bookingType: `${medicalTest?.isHomeServiceAvailable ? 'Home Care Health Service' : medicalTest?.services[0].serviceName}`,

    referBy: `${payload?.patientInfo?.referBy}`,
    organization: isOrganizationExists.organizationName,
    address: isOrganizationExists.organizationAddress,
    patientName: payload.patientInfo.name,
    test: payload.medicalTestLists[0].testName,
  });

  //   const emailContentForPatient = `
  //    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
  //      <h2 style="color: #4CAF50;">Your Appointment has been Scheduled</h2>
  //      <p>Dear <strong>${payload.patientInfo.name}</strong>,</p>
  //      <p>We are pleased to confirm your appointment at <strong>${isOrganizationExists.organizationName}</strong>.</p>
  //      <h3 style="color: #333;">Appointment Details:</h3>
  //      <ul style="list-style-type: none; padding: 0;">
  //        <li><strong>Appointment Status:</strong> ${payload.appointmentStatus}</li>
  //        <li><strong>Test:</strong> ${payload.medicalTestLists.map(test => test.testName).join(', ')}</li>

  //      </ul>
  //      <p style="margin-top: 20px;">Our team will reach out to you shortly for choosing your suitable date and time using the details you provided..
  //      We are thrilled to have you as our customer.
  //    Get ready for a great experience.
  //    If you have any further queries or need to cancel your order, please feel free to contact us at this number: ${process.env.ADMIN_PHONE}
  //      </p>
  //      <p style="font-weight: bold;">Best Regards,</p>
  //       <p style="font-weight: bold;">${process.env.APP_NAME}</p>

  //    </div>
  //  `;
  //  <li><strong>Test Dates:</strong> ${payload.medicalTestLists.map(test => `${test.appointmentTiming.day} from ${test.appointmentTiming.startTime} to ${test.appointmentTiming.endTime}`).join(', ')}</li>
  //        <li><strong>Location:</strong> ${isOrganizationExists.organizationAddress}</li>
  /* <p>${secureUrl ? `<img src="${secureUrl}" alt="Prescription Photo" style="max-width: 100%; height: auto;"/>` : ''}</p> */
  // <p>${secureUrl ? `<a href="${secureUrl}" download style="display: inline-block; margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Prescription Photo</a>` : ''}</p>

  const emailContentForAdmin = HtmltemplateForAdmin({
    user: 'Admin',
    amount: `${payload.medicalTestLists[0].mrp}`,
    bookingType: `${medicalTest?.isHomeServiceAvailable ? 'Home Care Health Service' : medicalTest?.services[0].serviceName}`,
    referBy: `${payload?.patientInfo?.referBy}`,
    organization: isOrganizationExists.organizationName,
    patientName: payload.patientInfo.name,
    test: payload.medicalTestLists[0].testName,
    contactNumber: payload.patientInfo.contactNumber,
    address: payload?.patientInfo?.address ? payload?.patientInfo?.address : '',
  });

  if (payload.patientInfo.contactNumber) {
    await sendSMS(`+91${payload.patientInfo.contactNumber}`, smsClient);
    await sendSMS(`${process.env.ADMIN_PHONE}`, smsAdmin);
  }

  // Send confirmation email to the patient
  if (payload.patientInfo.email) {
    await sendEmail(
      payload.patientInfo.email,
      emailContentForPatient,
      'Appointment Confirmation',
    );
  }
  await sendEmail(
    [process.env.ADMIN_EMAIL as string, 'skjasimuddin9153@gmail.com'],
    emailContentForAdmin,
    'New Appointment Created',
  );

  // Send notification email to the admin

  return newAppointment;
};
const createDirectAppointment = async (
  file: any,
  payload: TAppointment,
  userInfo: any,
) => {
  let secureUrl = null; // Variable to hold the secure URL

  console.log('this is direct booking api');
  console.log('file printing', file);
  if (file) {
    const imageName = `${userInfo.contactNumber}${payload.patientInfo.name}`;
    const path = file?.path;
    //send image to cloudinary
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    payload.prescriptionPhoto = secure_url as string;
    secureUrl = secure_url; // Set the secure URL

    console.log('secure_url', secureUrl);
  }
  payload.patientId = userInfo?._id;
  payload.directAppointment = true;
  payload.organization = '673d3d6234352e1ffcf2e254' as any;

  const newAppointment = await Appointment.create(payload);

  // Construct the HTML content for the email
  const emailContentForPatient = `
   <div style="font-family: Arial, sans-serif; color: #333;">
     <h3 style="color: #4CAF50;">Your prescription has been uploaded successfully</h3>
     <p>Dear <strong>${payload.patientInfo.name}</strong>,</p>
     <p>Thank you for uploading your prescription. We are thrilled to have you as our customer. Here are the details:</p>
     <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
       <ul style="list-style-type: none; padding: 0;">
         <li><strong>Appointment Status:</strong> PENDING</li>
         <li><strong>Test:</strong> We will notify you soon!</li>
       </ul>
       ${secureUrl ? `<img src="${secureUrl}" alt="Prescription Photo" style="max-width: 100%; height: auto;"/>` : ''}
       ${secureUrl ? `<a href="${secureUrl}" download style="display: inline-block; margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Prescription Photo</a>` : ''}
     </div>
     <p>If you have any further inquiries, please feel free to <a href="mailto:${process.env.MAIL_FROM}" style="color: #4CAF50;">contact us</a>.</p>
     <p style="font-weight: bold;">Best Regards,</p>
     <p style="font-style: italic;">The ${process.env.APP_NAME} Team 😊</p>
   </div>
 `;

  const smsForClient = `Thank you, ${payload.patientInfo.name}, for your prescription. We’ll confirm your date and time soon. Questions? Call ${process.env.ADMIN_PHONE}`;
  const smsForAdmin = `Patient: ${payload.patientInfo.name}, Contact: ${payload.patientInfo.contactNumber}, Service: Prescription Booking.
`;

  const emailContentForAdmin = `
   <div style="font-family: Arial, sans-serif; color: #333;">
     <h2 style="color: #4CAF50;">New Prescription Uploaded</h2>
     <p>We are excited to inform you that a new prescription has been uploaded for <strong>${payload.patientInfo.name}</strong>.</p>
     <p><strong>Patient Details:</strong></p>
     <ul style="list-style-type: none; padding: 0;">
       <li><strong>Patient:</strong> ${payload.patientInfo.name}</li>
       <li><strong>Patient Contact:</strong> ${userInfo.contactNumber}</li>
     </ul>
     ${secureUrl ? `<img src="${secureUrl}" alt="Prescription Photo" style="max-width: 100%; height: auto;"/>` : ''}
     ${secureUrl ? `<a href="${secureUrl}" download style="display: inline-block; margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Prescription Photo</a>` : ''}
     <p>Please take a moment to review the details and confirm with the patient at your earliest convenience.</p>
     <p style="font-weight: bold;">Thank you for your attention!</p>
     <p>Best Regards,</p>
     <p style="font-style: italic;">The ${process.env.APP_NAME} Team 😊</p>
   </div>
 `;

  const contactNumber = payload?.patientInfo.contactNumber.startsWith('91')
    ? payload?.patientInfo.contactNumber
    : `91${payload?.patientInfo.contactNumber}`;

  const clientWhatsappTemplate = WA_DirectBookingSendClient({
    to: [contactNumber],
    message: payload?.patientInfo.name,
  });

  const admintemplate = WA_DirectBookingSendAdmin({
    name: payload?.patientInfo.name,
    patientAge: `${payload?.patientInfo.age}`,
    patientnumber: payload?.patientInfo.contactNumber,
    to: [`${process.env.ADMIN_WHATSAPP}`],
  });

  if (payload?.patientInfo.contactNumber) {
    // await sendSMS(`+91${payload.patientInfo.contactNumber}`, smsForClient);

    // await sendSMS(`${process.env.ADMIN_PHONE}`, smsForAdmin);
    await sendWhatsApp(clientWhatsappTemplate);
    await sendWhatsApp(admintemplate);
  }

  // Send confirmation email to the patient
  if (payload.patientInfo.email) {
    await sendEmail(
      payload.patientInfo.email,
      emailContentForPatient,
      'Appointment Confirmation',
    );
  }
  await sendEmail(
    [
      process.env.MAIL_FROM as string,
      process.env.ADMIN_EMAIL as string,
      'skjasimuddin9153@gmail.com',
    ],
    emailContentForAdmin,
    'New Prescription Uploaded',
  );

  return newAppointment;
};

const createAppionmentFromCart = async (
  payload: TAppointment,
  userInfo: TUser,
) => {
  let secureUrl = null; // Variable to hold the secure URL

  console.log('payload', payload);
  // Fetch all cart items for the user

  console.log('userInfo._id', userInfo._id);

  const cart = await Cart.findOne({ user: userInfo._id });

  console.log('cart', cart);
  const isOrganizationExists = await Organization.findById(
    cart?.medicalTests[0].organization,
    { medicalTests: 0 }, // Exclude the medicalTests attribute
  );

  // const medecalTest =
  console.log('isOrganizationExists', isOrganizationExists);
  const medicalTest = await MedicalTest.findOne({
    testCode: cart?.medicalTests[0].testCode,
  }).populate({
    path: 'organization',
    select: 'organizationName',
  });

  console.log('medicalTest', medicalTest);
  // return;

  if (!isOrganizationExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Organization doesn't exists!");
  }

  console.log('cart', cart);

  if (!cart || cart.medicalTests.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No items in cart to create appointment!',
    );
  }
  console.log('cart', cart);
  // Create appointments for each medical test in the cart
  const appointments = [];
  const appointmentDetails = [];

  const serviceName = payload?.serviceName;
  console.log('serviceName', serviceName);
  let totalPrice = 0; // To accumulate appointment details for email and SMS
  for (const medicalTest of cart.medicalTests) {
    console.log(
      'medicalTest?.appointmentTiming',
      medicalTest?.appointmentTiming,
    );
    totalPrice = totalPrice + medicalTest.discountedPrice;
    const appointmentPayload = {
      ...payload,
      medicalTestLists: [medicalTest], // Assign the current medical test
      patientId: userInfo._id,
      directAppointment: false,
      organization: cart?.medicalTests[0].organization,
    };

    const newAppointment = await Appointment.create(appointmentPayload);
    appointments.push(newAppointment);
    appointmentDetails.push({
      testName: medicalTest.testName,
      appointmentStatus: newAppointment.appointmentStatus,
    });
  }

  // Delete all cart items after creating appointments
  // await Cart.deleteOne({ user: userInfo._id });

  // Construct a single email and SMS content for the entire cart
  const appointmentList = appointmentDetails
    ?.map(detail => `${detail.testName}`)
    ?.join(', ');

  let smsClient = {};
  let smsAdmin = {};
  if (serviceName?.includes('Book Appoinment')) {
    console.log('Booking type appionment');
    // smsClient = smsFormatBookAppointmentClient({
    //   name: payload?.patientInfo?.name,
    //   amount: `${totalPrice}`,
    //   bookingType: serviceName,
    //   test: appointmentList,
    //   location: payload.patientInfo.address
    //     ? payload?.patientInfo?.address
    //     : 'No Address Provided',
    //   referredBy: payload?.patientInfo?.referBy,
    // });

    // smsAdmin = smsFormatBookAppointmentAdmin({
    //   name: payload?.patientInfo?.name,
    //   amount: `${totalPrice}`,
    //   test: appointmentList,

    //   referredBy: payload?.patientInfo?.referBy,
    //   contactNumber: payload.patientInfo.contactNumber,
    //   organizationName: isOrganizationExists.organizationName,
    //   serviceName: serviceName,
    // });

    smsAdmin = WA_AppoinmentAdmin({
      amount: `${totalPrice}`,
      diagnosticCenterName: isOrganizationExists.organizationName,
      patientAge: `${payload?.patientInfo?.age}`,
      patientContact: payload?.patientInfo?.contactNumber,

      patientName: payload?.patientInfo?.name,
      patientSex: payload?.patientInfo?.sex
        ? payload?.patientInfo?.sex
        : 'Not provided',
      referredBy: payload?.patientInfo?.referBy
        ? payload?.patientInfo?.referBy
        : 'Not Provide',
      tests: appointmentList,
      to: `${process.env.ADMIN_WHATSAPP}`,
    });

    smsClient = WA_AppoinmentClient({
      amount: `${totalPrice}`,
      diagnosticCenterName: isOrganizationExists.organizationName,
      patientAge: `${payload?.patientInfo?.age}`,
      patientContact: payload?.patientInfo?.contactNumber,

      patientName: payload?.patientInfo?.name,
      patientSex: payload?.patientInfo?.sex
        ? payload?.patientInfo?.sex
        : 'Not provided',
      referredBy: payload?.patientInfo?.referBy
        ? payload?.patientInfo?.referBy
        : 'Not Provide',
      tests: appointmentList,
      to: `91${payload.patientInfo.contactNumber}`,
    });
  } else {
    console.log('Booking type Homecare');

    smsClient = WA_HomecareClient({
      amount: `${totalPrice}`,
      diagnosticCenterName: isOrganizationExists.organizationName,
      patientAge: `${payload?.patientInfo?.age}`,
      patientAddress: payload.patientInfo.address,

      patientName: payload?.patientInfo?.name,
      patientSex: payload?.patientInfo?.sex
        ? payload?.patientInfo?.sex
        : 'Not provided',
      referredBy: payload?.patientInfo?.referBy
        ? payload?.patientInfo?.referBy
        : 'Not Provide',
      tests: appointmentList,
      to: `91${payload.patientInfo.contactNumber}`,
    });

    smsAdmin = WA_HomeCareAdmin({
      amount: `${totalPrice}`,
      diagnosticCenterName: isOrganizationExists.organizationName,
      patientAge: `${payload?.patientInfo?.age}`,
      patientAddress: `${payload.patientInfo.address} , ${payload.patientInfo.pinCode}`,

      patientName: payload?.patientInfo?.name,
      patientSex: payload?.patientInfo?.sex
        ? payload?.patientInfo?.sex
        : 'Not provided',
      referredBy: payload?.patientInfo?.referBy
        ? payload?.patientInfo?.referBy
        : 'Not Provide',
      tests: appointmentList,
      to: `${process.env.ADMIN_WHATSAPP}`,
      patientContact: payload.patientInfo.contactNumber,
    });

    // smsClient = smsFormatHomeCareClient({
    //   name: payload?.patientInfo?.name,
    //   amount: `${totalPrice}`,
    //   test: appointmentList,
    //   address: payload.patientInfo.address,
    // });
    // smsAdmin = smsFormatHomeCareAdmin({
    //   name: payload?.patientInfo?.name,
    //   amount: `${totalPrice}`,
    //   test: appointmentList,
    //   address: payload.patientInfo.address,
    //   contact: payload.patientInfo.contactNumber,
    //   organizationName: isOrganizationExists.organizationName,
    // });
  }

  const emailContentForPatient = HtmltemplateForService({
    user: payload.patientInfo.name,
    amount: `${totalPrice}`,
    bookingType: serviceName,
    referBy: `${payload?.patientInfo?.referBy}`,
    organization: isOrganizationExists.organizationName,
    address: isOrganizationExists.organizationAddress,
    patientName: payload.patientInfo.name,
    test: appointmentList,
  });
  //   const emailContentForPatient = `
  //    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
  //      <h2 style="color: #4CAF50;">Your Appointment has been Scheduled</h2>
  //      <p>Dear <strong>${payload.patientInfo.name}</strong>,</p>
  //      <p>We are pleased to confirm your appointment \n
  //      <h3 style="color: #333;">Appointment Details:</h3>
  //      <ul style="list-style-type: none; padding: 0;">
  //        <li><strong>Appointment Status:</strong> PENDING</li>
  //        <li><strong>Test:</strong> ${appointmentList}</li>

  //      </ul>
  //           <p style="font-size: 16px;">Our team will reach out shortly for choosing your suitable date and time using the details you provided.
  //           We are thrilled to have you as our customer.
  //    Get ready for a great experience.
  //    If you have any further queries or need to cancel your order, please feel free to contact us at this number: ${process.env.ADMIN_PHONE}
  //           </p>
  //      <p style="margin-top: 20px;">For any further inquiries, please contact us.</p>
  //      <p style="font-weight: bold;">Best Regards,</p>
  //       <p style="font-weight: bold;">${process.env.APP_NAME}</p>

  //    </div>
  //  `;
  //  <li><strong>Test Dates:</strong> ${payload.medicalTestLists.map(test => `${test.appointmentTiming.day} from ${test.appointmentTiming.startTime} to ${test.appointmentTiming.endTime}`).join(', ')}</li>
  //        <li><strong>Location:</strong> ${isOrganizationExists.organizationAddress}</li>
  /* <p>${secureUrl ? `<img src="${secureUrl}" alt="Prescription Photo" style="max-width: 100%; height: auto;"/>` : ''}</p> */
  // <p>${secureUrl ? `<a href="${secureUrl}" download style="display: inline-block; margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Prescription Photo</a>` : ''}</p>

  const emailContentForAdmin = HtmltemplateForAdmin({
    user: 'Admin',
    amount: `${totalPrice}`,
    bookingType: serviceName,
    referBy: `${payload?.patientInfo?.referBy}`,
    organization: isOrganizationExists.organizationName,
    patientName: payload.patientInfo.name,
    test: appointmentList,
    contactNumber: payload.patientInfo.contactNumber,
    address: payload?.patientInfo?.address ? payload?.patientInfo?.address : '',
  });
  //   const emailContentForAdmin = `
  //    <div style="font-family: Arial, sans-serif; color: #333;">
  //      <h2 style="color: #4CAF50;">New Appointment Created</h2>
  //      <p style="font-size: 16px;">A new appointment has been scheduled for patient <strong>${payload.patientInfo.name}</strong>.</p>
  //      <h3 style="color: #4CAF50;">Appointment Details:</h3>
  //      <ul style="list-style-type: none; padding: 0;">
  //        <li><strong>Patient:</strong> ${payload.patientInfo.name}</li>
  //        <li><strong>Test:</strong> ${appointmentList}</li>
  //        <li><strong>Patient Contact:</strong> ${userInfo.contactNumber}</li>

  //      </ul>
  //      <p style="font-size: 16px;">Please ensure to review the appointment and confirm with the patient.</p>
  //      <p style="font-size: 16px;">Best Regards,</p>
  //      <p style="font-weight: bold;"> The ${process.env.APP_NAME} Team 😊</p>

  //    </div>
  //  `;

  console.log('payload.patientInfo.email,', payload.patientInfo.email);
  // Send SMS and email for the patient
  if (payload?.patientInfo.contactNumber) {
    // await sendSMS(`+91${payload.patientInfo.contactNumber}`, smsClient);
    // await sendSMS(`${process.env.ADMIN_PHONE}`, smsAdmin);
    await sendWhatsApp(smsAdmin);
    await sendWhatsApp(smsClient);
    if (payload.patientInfo.email) {
      await sendEmail(
        payload.patientInfo.email,
        emailContentForPatient,
        'Appointment Confirmation',
      );
    }
  }

  // Send email to the admin
  await sendEmail(
    [process.env.ADMIN_EMAIL as string, 'skjasimuddin9153@gmail.com'],
    emailContentForAdmin,
    'New Appointments Created . Please Check Email for more information',
  );

  return appointments; // Return the created appointments
};

const getMyAppointment = async (
  query: Record<string, unknown>,
  authUser: any,
) => {
  const queryObj: Record<string, unknown> = {};
  if (authUser?.role === USER_ROLE.patient) {
    queryObj.patientId = authUser?._id;
  } else {
    queryObj.organization = authUser?._id;
  }
  const courseQuery = new QueryBuilder(Appointment.find(queryObj), query)
    .search(appointmentFilterableFields)
    .filter()
    // .sort()
    .paginate()
    .fields();

  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();

  return {
    meta,
    result,
  };
};

// const getAllFromDB = async (
//   filters: any,
//   options: IPaginationOptions,
// ): Promise<IGenericResponse<Appointment[]>> => {
//   const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//   const { searchTerm, ...filterData } = filters;
//   const andConditions = [];

//   // if (searchTerm) {
//   //     andConditions.push({
//   //         OR: appointmentSearchableFields.map(field => ({
//   //             [field]: {
//   //                 contains: searchTerm,
//   //                 mode: 'insensitive',
//   //             },
//   //         })),
//   //     });
//   // }

//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map(key => {
//         if (appointmentRelationalFields.includes(key)) {
//           return {
//             [appointmentRelationalFieldsMapper[key]]: {
//               email: (filterData as any)[key],
//             },
//           };
//         } else {
//           return {
//             [key]: {
//               equals: (filterData as any)[key],
//             },
//           };
//         }
//       }),
//     });
//   }

//   // console.dir(andConditions, { depth: Infinity })
//   const whereConditions: Prisma.AppointmentWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.appointment.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : {
//             createdAt: 'desc',
//           },
//     include: {
//       doctor: true,
//       patient: true,
//     },
//   });
//   const total = await prisma.appointment.count({
//     where: whereConditions,
//   });

//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };

const cancelAppointment = async (id: string, userInfo: any) => {
  const findAppintment = await Appointment.findById(id);
  if (!findAppintment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Appointment not exit!');
  }
  if (userInfo?._id?.toString() !== findAppintment?.patientId?.toString()) {
    if (userInfo?.role !== 'superAdmin' || userInfo?.role !== 'admin') {
      throw new AppError(httpStatus.BAD_REQUEST, 'You have not permisson!');
    }
  }
  const cancelAppointment = await Appointment.findByIdAndUpdate(
    id,
    {
      appointmentStatus: 'CANCELED',
    },
    {
      new: true,
    },
  );
  return cancelAppointment;
};

const changeAppointmentStatus = async (
  id: string,
  status: TAppointmentStatus,
  userInfo: any,
) => {
  const findAppintment = await Appointment.findById(id);

  if (!findAppintment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Appointment not exit!');
  }
  if (
    findAppintment.appointmentStatus === 'CANCELED' ||
    findAppintment.appointmentStatus === 'COMPLETED'
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Appointment Already ${findAppintment.appointmentStatus}`,
    );
  }
  if (userInfo?._id?.toString() !== findAppintment?.patientId?.toString()) {
    if (userInfo?.role !== 'superAdmin' || userInfo?.role !== 'admin') {
      throw new AppError(httpStatus.BAD_REQUEST, 'You have not permisson!');
    }
  }

  const changeAppointment = await Appointment.findByIdAndUpdate(
    id,
    {
      appointmentStatus: status,
    },
    {
      new: true,
    },
  );
  return changeAppointment;
};
export const AppointmentServices = {
  createAppointment,
  getMyAppointment,
  cancelAppointment,
  changeAppointmentStatus,
  createDirectAppointment,
  createAppionmentFromCart,
};
