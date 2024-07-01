export const paginate = async (model, query, page, limit) => {
    try {
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 50;
        const skip = (pageNumber - 1) * pageSize;
        let filter
        if(query?.status){
             filter = {
            status: query.status, 
        }
        }
        else{
            filter ={}
        }
        if(query?.role){
            filter.role = { $in: ['citizen', 'candidate'] };
        }
       
        console.log(filter)
        const total = await model.countDocuments(filter);
        const results = await model.find(filter).skip(skip).limit(pageSize);

        const pages = Math.ceil(total / pageSize);

        return {
            page: pageNumber,
            limit: pageSize,
            total,
            pages,
            results,
        };
    } catch (error) {
        throw new Error(`Pagination error: ${error.message}`);
    }
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
  