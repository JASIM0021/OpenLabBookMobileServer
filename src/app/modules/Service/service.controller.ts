import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ServiceServices } from './service.service';

const createService = catchAsync(async (req, res) => {
  const result = await ServiceServices.createServiceIntoDB(
    req.file,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service is created successfully',
    data: result,
  });
});

const getAllService = catchAsync(async (req, res) => {
  const result = await ServiceServices.getAllServicesFromDB(
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result =
    await ServiceServices.getSingleServiceFromDB(organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service is retrieved successfully',
    data: result,
  });
});

const updateService = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result =
    await ServiceServices.updateServiceIntoDB(
    req.file,

      organizationId,
      req.body,
    );
    

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service  is updated successfully',
    data: result,
  });
});


const deleteService= catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result = await ServiceServices.deleteServiceFromDB(organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service is deleted successfully',
    data: result,
  });
});

const availabilityStatusOrganization= catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result = await ServiceServices.availabilityStatusOrganizationFromDB(organizationId,req.body.isAvailability);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service is deleted successfully',
    data: result,
  });
});
export const ServiceControllers = {
  createService,
  getAllService,
  getSingleService,
  updateService,
  deleteService,
  availabilityStatusOrganization
  // getAllAcademicDepartments,
  // getSingleAcademicDepartment,
  // updateAcademicDeartment,
};
