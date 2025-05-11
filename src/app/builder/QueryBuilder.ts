import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Filtering

    const excludeFields = [
      'searchTerm',
      'sortBy',
      'limit',
      'page',
      'fields',
      'minPrice',
      'maxPrice',
      'tags',
      'level',
      'startDate',
      'endDate',
      'sales',
      'toDate',
      'fromDate',
      'types',
      'sizes',
      'fragrances',
      'productStock',
      'undefined',
      'bloomToDate',
      'bloomFromDate',
      'isAvailable',
      'mrp',
      "locationCover",
      "coverAddress",
      "serviceCoverAreaAddress"
    ];

    excludeFields.forEach((el) => delete queryObj[el]);




  //   services: {
  //     $elemMatch: { serviceName: serviceName }
  // }

     // Check if `coverAddress` is provided and search `coverAddress` using $in
     if (this.query.coverAddress !== undefined) {
      this.modelQuery = this.modelQuery.find({
        coverAddress: { $in: this.query.coverAddress },
      });
    }
     if (this.query.serviceCoverAreaAddress !== undefined) {
      this.modelQuery = this.modelQuery.find({
        serviceCoverAreaAddress: { $in: this.query.serviceCoverAreaAddress },
      });
    }

    // Check if `serviceName` is provided and search in `services`
    // if (this.query.serviceName !== undefined) {
    //   this.modelQuery = this.modelQuery.find({
    //     services: { $elemMatch: { serviceName: { $regex: regex } } },
    //   });
    // }

    if (
      this.query.maxPrice !== undefined ||
      this.query.minPrice !== undefined
    ) {
      queryObj.mrp = {
        $gte: Number(this.query.minPrice || 0),
        $lte: Number(this.query.maxPrice || 1000000000),
      };
    }
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalDocuments = await this.modelQuery.clone().countDocuments();
    const total = totalDocuments;
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPage,
    };
  }
}

export default QueryBuilder;
