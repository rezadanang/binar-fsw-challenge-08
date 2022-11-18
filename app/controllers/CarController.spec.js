const CarController = require('./CarController');
const page = require('./ApplicationController');
const { Car } = require('../models');

describe('CarController', () => {
    describe('#handleGetCar', () => {
        it('Should return data car', async () => {
            const Cars = [
                {
                id: 1,
                name: 'Mazda RX4',
                price: '300000',
                size:  'Small',
                image: 'mazda-rx4.jpg',
                isCurrentlyRented: true,
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
                json: jest.fn().mockReturnThis(),
            }

            await carsController.handleGetCar(mockRequest, mockResponse );

            expect(mockcarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(Cars);
        })
    });

    describe('#handleCreateCar', () => {
        it('Should return 201 code and the car is created', async () => {
                const Cars = new Car({
                    id: 1,
                    name: 'Mazda RX4',
                    price: '300000',
                    size:  'Small',
                    image: 'mazda-rx4.jpg',
                    isCurrentlyRented: false,
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
                        image: 'mazda-rx4.jpg',
                    },
                };

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };

                await carsController.handleCreateCar(mockRequest, mockResponse);

                expect(mockCar.create).toHaveBeenCalledWith({
                    ...mockRequest.body,
                    isCurrentlyRented: false,
                });
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(Cars);
                });

            it("Should return 422 code if there is an error", async () => {
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
                        image: 'mazda-rx4.jpg',
                    },
                };

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };

                await carsController.handleCreateCar(mockRequest, mockResponse);

                expect(mockCar.create).toHaveBeenCalledWith({
                    ...mockRequest.body,
                    isCurrentlyRented: false,
                });
                expect(mockResponse.status).toHaveBeenCalledWith(422);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: {
                    name: expect.any(String),
                    message: expect.any(String),
                    },
                });

        });

    });

    describe('#handleUpdateCar', () => {
        it('Should return a 200 code if updated', async () => {
            const Cars = new Car({
                id: 1,
                name: 'Mazda RX4',
                price: '300000',
                size:  'Small',
                image: 'mazda-rx4.jpg',
                isCurrentlyRented: false,
            });
            const mockCar = {
                findByPk: jest.fn().mockReturnValue(Cars),
            };

            const carsController = new CarController({
                carModel: mockCar,
            });

            const mockRequest = {
                body: {
                    name: "Mazda RX4",
                    price: "300000",
                    size: "Small",
                    image: "mazda-rx4.jpg",
                },
                params: {
                id: 1,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await carsController.handleUpdateCar(mockRequest, mockResponse);

            expect(mockCar.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(Cars);
        });


        it("should return a 422 code and car status not updated", async () => {
                    const mockCar = {
                        findByPk: jest.fn().mockReturnValue(null),
                    };

                    const carsController = new CarController({
                        carModel: mockCar,
                    });

                    const mockRequest = {
                    body: {
                        name: 'Mazda RX4',
                        price: '300000',
                        size:  'Small',
                        image: 'mazda-rx4.jpg',
                        isCurrentlyRented: false,
                        },
                        params: {
                        id: 1,
                        },
                    };
                    const mockResponse = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn().mockReturnThis(),
                    };

                    await carsController.handleUpdateCar(mockRequest, mockResponse);

                    expect(mockCar.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
                    expect(mockResponse.status).toHaveBeenCalledWith(422);
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: {
                            name: expect.any(String),
                            message: expect.any(String),
                        },
                   });
            });

    });


        describe('#handleDeleteCar', () => {
            it('should return a 204 code an deleted data car', async () => {
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
                mockCar.destroy = jest.fn().mockReturnValue(car);
                const mockResponse = {};
                mockResponse.status = jest.fn().mockReturnThis();
                mockResponse.end = jest.fn().mockReturnThis();
                const carsController = new CarController({
                    carModel: mockCar,
                });

                await carsController.handleDeleteCar(mockRequest, mockResponse);

                expect(mockResponse.status).toHaveBeenCalledWith(204);
                expect(mockResponse.end).toHaveBeenCalled();
            });

      });

});