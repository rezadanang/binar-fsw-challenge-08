const CarController = require('./CarController');
const Page = require('./ApplicationController');
const { Car } = require('../models');
const dayjs = require("dayjs");

const mockDataCar = {
    'id': 1,
    'name': 'Mazda RX4',
    'price': '300000',
    'size':  'Small',
    'image': 'mazda-rx4.jpg',
    'isCurrentlyRented': false,
    'createdAt': '2022-11-19T07:56:12.226Z',
    'updatedAt': '2022-11-19T07:56:12.226Z',
    'userCar': null
};

const mockUserCar = {
    id: 1,
    userId: 1,
    carId: 1,
    rentStartedAt: null,
    rentEndedAt: null,
    createdAt: null,
    updatedAt: null
};

const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
};

describe('CarController', () => {
    describe('#handleGetCar', () => {
        it('should return data cars', async () => {
            const Cars = [
                {
                id: 1,
                name: 'Mazda RX4',
                price: '300000',
                size:  'Small',
                image: 'mazda-rx4.jpg',
                isCurrentlyRented: true
                }
            ];

            const carsController = new CarController({
                carModel: mockcarModel
            });

            const mockcarModel = {
                findByPk: jest.fn().mockReturnValue(Cars)
            }

            const mockRequest = {
                params: {
                    id: 1
                }
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            }

            await carsController.handleGetCar(mockRequest, mockResponse );

            expect(mockcarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(Cars);
        })
    });

    describe('#handleCreateCar', () => {
        it('should response status 201 and the car is created', async () => {
                const Cars = new Car({
                    id: 1,
                    name: 'Mazda RX4',
                    price: '300000',
                    size:  'Small',
                    image: 'mazda-rx4.jpg',
                    isCurrentlyRented: false
                });
                const mockCar = {
                    create: jest.fn().mockReturnValue(Cars),
                };

                const carsController = new CarController({
                    carModel: mockCar
                });

                const mockRequest = {
                    body: {
                        name: 'Mazda RX4',
                        price: '300000',
                        size:  'Small',
                        image: 'mazda-rx4.jpg'
                    },
                };

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                };

                await carsController.handleCreateCar(mockRequest, mockResponse);

                expect(mockCar.create).toHaveBeenCalledWith({
                    ...mockRequest.body,
                    isCurrentlyRented: false
                });
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(Cars);
                });

        it("should response status 422 if there is an error", async () => {
                const mockCar = {
                    create: jest.fn(() => Promise.reject(err)),
                };

                const carsController = new CarController({
                    carModel: mockCar
                });

                const mockRequest = {
                    body: {
                        name: 'Mazda RX4',
                        price: '300000',
                        size:  'Small',
                        image: 'mazda-rx4.jpg'
                    },
                };

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                };

                await carsController.handleCreateCar(mockRequest, mockResponse);

                expect(mockCar.create).toHaveBeenCalledWith({
                    ...mockRequest.body,
                    isCurrentlyRented: false
                });
                expect(mockResponse.status).toHaveBeenCalledWith(422);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: {
                    name: expect.any(String),
                    message: expect.any(String)
                    },
                });

        });

    });

    describe('#handleUpdateCar', () => {
        it('should response status 200 if updated car', async () => {
            const Cars = new Car({
                id: 1,
                name: 'Mazda RX4',
                price: '300000',
                size:  'Small',
                image: 'mazda-rx4.jpg',
                isCurrentlyRented: false
            });
            const mockCar = {
                findByPk: jest.fn().mockReturnValue(Cars),
            };

            const carsController = new CarController({
                carModel: mockCar
            });

            const mockRequest = {
                body: {
                    name: "Mazda RX4",
                    price: "300000",
                    size: "Small",
                    image: "mazda-rx4.jpg"
                },
                params: {
                id: 1
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };

            await carsController.handleUpdateCar(mockRequest, mockResponse);

            expect(mockCar.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(Cars);
        });


        it("should response status 422 and car status not updated", async () => {
                    const mockCar = {
                        findByPk: jest.fn().mockReturnValue(null)
                    };

                    const carsController = new CarController({
                        carModel: mockCar
                    });

                    const mockRequest = {
                    body: {
                        name: 'Mazda RX4',
                        price: '300000',
                        size:  'Small',
                        image: 'mazda-rx4.jpg',
                        isCurrentlyRented: false
                        },
                        params: {
                        id: 1
                        },
                    };
                    const mockResponse = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn().mockReturnThis()
                    };

                    await carsController.handleUpdateCar(mockRequest, mockResponse);

                    expect(mockCar.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
                    expect(mockResponse.status).toHaveBeenCalledWith(422);
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: {
                            name: expect.any(String),
                            message: expect.any(String)
                        },
                   });
            });

    });


    describe('#handleDeleteCar', () => {
        it('should response status 204 an deleted data car', async () => {
            const Cars = {
                id: 1,
                name: 'Mazda RX4',
                price: '300000',
                size:  'Small',
                image: 'mazda-rx4.jpg',
                isCurrentlyRented: false,
            };
            const car = new Car({
                Cars,
            });

            const mockRequest = {
                params: {
                id: 1,
                },
            };
            const mockCar = {};
            const mockResponse = {};
            
            mockCar.destroy = jest.fn().mockReturnValue(car);
            mockResponse.status = jest.fn().mockReturnThis();
            mockResponse.end = jest.fn().mockReturnThis();

            const carsController = new CarController({
                carModel: mockCar
            });

            await carsController.handleDeleteCar(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.end).toHaveBeenCalled();
        });

    });
    describe('#handleRentCar', () => {
        it('should call response code 201 and return user car',
            async () => {
                const rentStartedAt = new Date().toISOString();
                const rentEndedAt = dayjs(rentStartedAt).add(1, 'day');
                const mockRequest = {
                    body: {
                        rentStartedAt,
                        rentEndedAt: null
                    },
                    params: {
                        id: 1
                    },
                    user: {
                        id: 1
                    },
                };
                const mockRes = { ...mockResponse };
                const mockNext = jest.fn();
                const mockCarModel = {
                    findByPk: jest.fn().mockReturnValue(mockDataCar)
                };
                const mockUserCarModel = {
                    findOne: jest.fn().mockReturnValue(null),
                    create: jest.fn().mockReturnValue({
                        ...mockUserCar,
                        rentStartedAt,
                        rentEndedAt
                    }),
                };
                const controller = new CarController({
                    carModel: mockCarModel,
                    userCarModel: mockUserCarModel,
                    dayjs
                });

                await controller.handleRentCar(mockRequest, mockRes, mockNext);

                expect(mockUserCarModel.create).toHaveBeenCalled();
                expect(mockRes.status).toHaveBeenCalledWith(201);
                expect(mockRes.json).toHaveBeenCalledWith({
                    ...mockUserCar,
                    rentStartedAt,
                    rentEndedAt
                });
            });

        it('should call response status 422 and error if car already rented.', async () => {
                const rentStartedAt = new Date().toISOString();
                const rentEndedAt = dayjs(rentStartedAt).add(1, 'day');
                const mockRequest = {
                    body: {
                        rentStartedAt,
                        rentEndedAt: null
                    },
                    params: {
                        id: 1
                    },
                    user: {
                        id: 1
                    },
                };
                const mockRes = { ...mockResponse };
                const mockNext = jest.fn();
                const mockCarModel = {
                    findByPk: jest.fn().mockReturnValue(mockDataCar)
                };
                const mockUserCarModel = {
                    findOne: jest.fn().mockReturnValue(true),
                    create: jest.fn().mockReturnValue({
                        ...mockUserCar,
                        rentStartedAt,
                        rentEndedAt
                    }),
                };
                const controller = new CarController({
                    carModel: mockCarModel,
                    userCarModel: mockUserCarModel,
                    dayjs
                });

                await controller.handleRentCar(mockRequest, mockRes, mockNext);

                const err = new CarAlreadyRentedError(mockDataCar);
                expect(mockRes.status).toHaveBeenCalledWith(422);
                expect(mockRes.json).toHaveBeenCalledWith(err);
            });

        it('should call next function on error', async () => {
                const rentStartedAt = new Date().toISOString();
                const mockRequest = {
                    body: {
                        rentStartedAt,
                        rentEndedAt: null
                    },
                    params: {
                        id: 1
                    },
                    user: {
                        id: 1
                    },
                };
                const mockRes = { ...mockResponse };
                const mockNext = jest.fn();
                const mockCarModel = {
                    findByPk: jest.fn().mockRejectedValue(new Error())
                };
                const mockUserCarModel = {};
                const controller = new CarController({
                    carModel: mockCarModel,
                    userCarModel: mockUserCarModel,
                    dayjs
                });
                await controller.handleRentCar(mockRequest, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });
    });

});