import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrganizationServices } from './organization.service';

const createOrganization = catchAsync(async (req, res) => {
  const result = await OrganizationServices.createOrganizationIntoDB(
    req.file,
    req.body,
  );

  console.log(' req.body,', req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization is created successfully',
    data: result,
  });
});

const getAllOrganization = catchAsync(async (req, res) => {
  const result = await OrganizationServices.getAllOrganizationsFromDB(
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result =
    await OrganizationServices.getSingleOrganizationFromDB(organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization is retrieved successfully',
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result = await OrganizationServices.updateOrganizationIntoDB(
    req.file,

    organizationId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization  is updated successfully',
    data: result,
  });
});

const deleteOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result =
    await OrganizationServices.deleteOrganizationFromDB(organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization is deleted successfully',
    data: result,
  });
});

const availabilityStatusOrganization = catchAsync(async (req, res) => {
  const { organizationId } = req.params;
  const result =
    await OrganizationServices.availabilityStatusOrganizationFromDB(
      organizationId,
      req.body.isAvailability,
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization is deleted successfully',
    data: result,
  });
});
export const OrganizationControllers = {
  createOrganization,
  getAllOrganization,
  getSingleOrganization,
  updateOrganization,
  deleteOrganization,
  availabilityStatusOrganization,
  // getAllAcademicDepartments,
  // getSingleAcademicDepartment,
  // updateAcademicDeartment,
};
