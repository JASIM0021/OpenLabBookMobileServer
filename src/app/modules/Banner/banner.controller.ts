import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BannerServices } from './banner.service';




const createBanner = catchAsync(async (req, res) => {
  const result = await BannerServices.createBannerFromDB(
    req.file,

    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is created successfully',
    data: result,
  });
});

const getSingleBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BannerServices.getSingleBannerFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is retrieved successfully',
    data: result,
  });
});

const getAllBanners = catchAsync(async (req, res) => {
  const result = await BannerServices.getAllBannerFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { admin } = req.body;
  const result = await BannerServices.updateBannerntoDB(id, admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is updated successfully',
    data: result,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BannerServices.deleteBannerFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is deleted successfully',
    data: result,
  });
});

export const BannerControllers = {
  getAllBanners,
  getSingleBanner,
  deleteBanner,
  updateBanner,
  createBanner
};
