const CarController = require('./CarController');
const { sequelize, Car } = require('../models');
const page = require('./ApplicationController');
const { queryInterface } = sequelize;


// beforeAll(async () => {

//     await queryInterface.bulkInsert('Cars', [
//         {
//             name:   'Avanza G 2022',
//             price:  '500000',
//             size:   'middle',
//             image:  'alvanza.jpg',
//             isCurrentlyRented: '',
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }

//     ], {});
// });

// afterAll(async () => {
//     await queryInterface.bulkDelete('Cars', null, {});
// });

describe('CarController', () => {

    // describe('handleListCar', () => {
    //     it('should return a list of cars', async () => {
    //     });

    // });

    describe('handleGetCar', () => {
        it('should return a car', async () => {
            const Cars = [
                {
                id: 1,
                name: 'Toyota Innova Reborn 2022',
                price: '700000',
                size:  'large',
                image: 'innova.jpg',
                isCurrentlyRented: true,
                },
                {
                id: 2,
                name: 'Toyota Innova 2022',
                price: '650000',
                size:  'large',
                image: 'innova.jpg',
                isCurrentlyRented: true,
                }
            ];

            const mockcarModel = {
                findByPk: jest.fn().mockReturnValue(Cars)
            }

            const carsController = new CarController({
                carModel: mockcarModel
            });

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
        it('should return 201 code and the car is created', async () => {
                const Cars = new Car({
                    id: 1,
                    name: "Kijang Innova Reborn",
                    price: "750000",
                    size: "large",
                    image: "innova.jpg",
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
                        name: "Kijang Innova Reborn",
                        price: "750000",
                        size: "large",
                        image: "innova.jpg",
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

            it("should return a 422 status if there's an error", async () => {
                const mockCar = {
                    create: jest.fn(() => Promise.reject(err)),
                };

                const carsController = new CarController({
                    carModel: mockCar
                });

                const mockRequest = {
                    body: {
                        name: "Kijang Innova Reborn",
                        price: "750000",
                        size: "large",
                        image: "innova.jpg",
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
        it('should return a 200 code an updated', async () => {
            const Cars = new Car({
                    id: 1,
                    name: "Kijang Innova Reborn",
                    price: "750000",
                    size: "large",
                    image: "innova.jpg",
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
                    name: "Kijang Innova Reborn",
                    price: "750000",
                    size: "large",
                    image: "innova.jpg",
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


        it("should return a 422 code and status cars not updated", async () => {
                    const mockCar = {
                        findByPk: jest.fn().mockReturnValue(null),
                    };

                    const carsController = new CarController({
                        carModel: mockCar,
                    });

                    const mockRequest = {
                    body: {
                        name: "Kijang Innova Reborn",
                        price: "750000",
                        size: "large",
                        image: "innova.jpg",
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
            it('should return a 204 code an deleted the car', async () => {
                const Cars = {
                    id: 1,
                    name: "Kijang Innova Reborn",
                    price: "750000",
                    size: "large",
                    image: "innova.jpg",
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
