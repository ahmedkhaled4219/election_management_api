export const paginate = async (model, page, limit) => {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 50;

    const skip = (pageNumber - 1) * pageSize;
    const total = await model.countDocuments({});

    const pages = Math.ceil(total / pageSize);
    const results = await model.find({}).skip(skip).limit(pageSize);

    return {
        page: pageNumber,
        limit: pageSize,
        total,
        pages,
        results,
    };
};
export const paginateArray = (array, page, limit) => {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 50;
  
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedArray = array.slice(startIndex, startIndex + pageSize);
  
    return {
      page: pageNumber,
      limit: pageSize,
      total: array.length,
      pages: Math.ceil(array.length / pageSize),
      results: paginatedArray,
    };
  };
  