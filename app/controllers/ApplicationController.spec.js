const { NotFoundError } = require('../errors');
const ApplicationController = require('./ApplicationController');

describe("ApplicationController", () =>{
    describe("#handleGetRoot", () => {
        it("should call res.status(200) and res.json with status and message", () => {
            
            const mockRequest = {};
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
              };

            const applicationController = new ApplicationController()
            
            applicationController.handleGetRoot(mockRequest, mockResponse);
        
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                message: "BCR API is up and running!",
            });

        })
    })

    describe("#handleNotFound", () =>{
        it("should call res.status(404) and res.json with error not found", () => {
            const mockRequest = {
                method: 'get',
                url: 'localhost:8000'
            };

            const err = new NotFoundError(mockRequest.method, mockRequest.url);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            }; 
            
            const applicationController = new ApplicationController()

            applicationController.handleNotFound(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: {
                  name: err.name,
                  message: err.message,
                  details: err.details,
                }
              });
        })
    })

    describe("#handleError", () =>{
        it("should call res.status(500) and res.json with error", () => {
            const mockRequest = {
                method: 'get',
                url: 'localhost:8000'
            };
            
            const err = new NotFoundError(mockRequest.method, mockRequest.url);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            
            const mockNext = {}
            const applicationController = new ApplicationController()

            applicationController.handleError(err, mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: {
                  name: err.name,
                  message: err.message,
                  details: err.details || null,
                }
              }); 
        })
    })

    describe("#getOffsetFromRequest", () =>{
        it("should return offset request", () => {
            const mockRequest = {
                query: {
                   page: 1,
                   pageSize: 10 
                }
            };
            const applicationController = new ApplicationController()
            const offset = applicationController.getOffsetFromRequest(mockRequest)
            expect(offset).toEqual(0)
        })
    })

    describe("#buildPaginationObject", () =>{
        it("should return build pagination", () => {
            const count = 10;
            const mockRequest = {
                query: {
                    page: 1,
                    pageSize: 10 
                 }
            }
            const applicationController = new ApplicationController()
            const paginationObject = applicationController.buildPaginationObject(mockRequest, count);
            expect(paginationObject).toEqual({
                page: 1,
                pageCount: 1,
                pageSize: 10,
                count: 10,
            });

        })
    })

})