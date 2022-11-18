const AuthenticationController = require('./AuthenticationController');
const { sequelize, User, Role } = require('../models');
// const authHelper = require('../helpers/auth.helper');
const { queryInterface } = sequelize;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {WrongPasswordError, RecordNotFoundError, NotFoundError } = require('../errors');

beforeAll(async () => {

    const password = await authHelper.encryptedPassword('12345678');

    await queryInterface.bulkInsert('Users', [
        {
            name:   'Ali Fahrial Anwar',
            email:  'alifarialanwar@gmail.com',
            image:  'alifahrial.jpg',
            encryptedPassword: password,
            roleId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name:   'Admin',
            email:  'admin@gmail.com',
            image:  'admin.jpg',
            encryptedPassword: password,
            roleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ], {});
});

// afterAll(async () => {
//     await queryInterface.bulkDelete('Users', null, {});
// });


describe('Auth Controller', () => {

    describe('#handleLogin()', () => {

        it('should return 201 and accessToken', async () => {

        const user = new User({
                id: 1,
                name: "Ali Fahrial",
                email: "alifahrial@gmail.com",
                image: 'ali.jpg',
                encryptedPassword: "$2a$10$oRN/emyTmhttkc44E7DGy.AAp9LLtZG4Vjs8Q4XAk.3F7RTB1J.BW",
                roleId: 1,
            });
            const roles = new Role({ id: 1, name: "CUSTOMER" });

            const mockUser = {
                findOne: jest.fn().mockReturnValue({
                    ...user.dataValues,
                    Role: roles,
                }),
            };
            const mockRequest = {
                body: {
                    email: "alifahrial@gmail.com",
                    password: "12345678",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            const next = jest.fn();

            const authentication = new AuthenticationController({
                userModel: mockUser,
                roleModel: roles,
                bcrypt,
                jwt,
            });

            await authentication.handleLogin(mockRequest, mockResponse, next);
            expect(mockUser.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockRequest.body.email.toLowerCase(),
                },
                include: [
                    {
                        model: roles,
                        attributes: ["id", "name"],
                    },
                ],
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
            accessToken: expect.any(String),
            });

        });

        it('should return error 401 and message', async () => {
            const user = new User({
                id: 1,
                name: "Ali Fahrial",
                email: "alifahrial@gmail.com",
                image: 'ali.jpg',
                encryptedPassword: "$2a$10$oRN/emyTmhttkc44E7DGy.AAp9LLtZG4Vjs8Q4XAk.3F7RTB1J.BW",
                roleId: 1,
            });
            const roles = new Role({ id: 1, name: "CUSTOMER" });

            const mockUser = {
                findOne: jest.fn().mockReturnValue({
                    ...user.dataValues,
                    Role: roles,
                }),
            };
            const mockRequest = {
                body: {
                    email: "alifahrial01@gmail.com",
                    password: "1234567",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            const next = jest.fn();

            const authentication = new AuthenticationController({
                userModel: mockUser,
                roleModel: roles,
                bcrypt,
                jwt,
            });

            const err = new WrongPasswordError();

            await authentication.handleLogin(mockRequest, mockResponse, next);
            expect(mockUser.findOne).toHaveBeenCalledWith({
                where: {
                    email: mockRequest.body.email.toLowerCase(),
                },
                include: [
                    {
                        model: roles,
                        attributes: ["id", "name"],
                    },
                ],
            });
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(err);
        });
    });

    describe('handleRegister', () => {

        it('should return 201 and accessToken', async () => {
            const user = new User({
                id: 100,
                name: "Fahrial07",
                email: "fahrial@gmail.com",
                encryptedPassword: "1234567890",
                roleId: 1,
            });

            const role = new Role({ id: 1, name: "CUSTOMER" });

            const mockUser = {
                findOne: jest.fn().mockReturnValue(null),
                create: jest.fn().mockReturnValue(user),
            };

            const roles = {
                findOne: jest.fn().mockReturnValue(role.name),
            };

            const mockRequest = {
                body: {
                    name: "Fahrial07",
                    email: "fahrial@gmail.com",
                    password: "1234567890",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            const next = jest.fn();
            const authentication = new AuthenticationController({
                userModel: mockUser,
                roleModel: roles,
                bcrypt,
                jwt,
            });

            await authentication.handleRegister(mockRequest, mockResponse, next);

            expect(mockUser.findOne).toHaveBeenCalledWith({
                where: { email: mockRequest.body.email.toLowerCase() },
            });
            expect(roles.findOne).toHaveBeenCalledWith({
                where: { name: role.name },
            });
            expect(mockUser.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                accessToken: expect.any(String),
            });
        });

    });

    describe('handleGetUserOrwhoAmI', () => {
        it('should return 200 status and user data ', async() => {
            const user = new User({
                id: 100,
                name: "Fahrial07",
                email: "fahrial@gmail.com",
                encryptedPassword: "1234567890",
                roleId: 1,
            });

            const mockUser = {
                ...user.dataValues,
                findByPk: jest.fn().mockReturnValue(user),
            };

            const roles = new Role({ id: 1, name: "CUSTOMER" });

            const mockRole = {
                ...roles.dataValues,
                findByPk: jest.fn().mockReturnValue(roles),
            };

            const mockRequest = {
                user: {
                    id: 100,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            const next = jest.fn();

            const authentication = new AuthenticationController({
                userModel: mockUser,
                roleModel: mockRole,
                bcrypt,
                jwt,
            });

            await authentication.handleGetUser(mockRequest, mockResponse, next);

            expect(mockUser.findByPk).toHaveBeenCalledWith(mockRequest.user.id);
            expect(mockRole.findByPk).toHaveBeenCalledWith(mockUser.roleId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(user);

        });

        it('should return 404 status ', async() => {
            const mockUser = {
                findByPk: jest.fn().mockReturnValue(null),
            };

            const roles = new Role({ id: 1, name: "CUSTOMER" });

            const mockRole = {
                ...roles.dataValues,
                findByPk: jest.fn().mockReturnValue(roles),
            };

            const mockRequest = {
                user: {
                    id: 2,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            const mockNext = jest.fn();

            const authentication = new AuthenticationController({
                userModel: mockUser,
                roleModel: mockRole,
                bcrypt,
                jwt,
            });

            await authentication.handleGetUser(mockRequest, mockResponse, mockNext);

            expect(mockUser.findByPk).toHaveBeenCalledWith(mockRequest.user.id);
            expect(mockResponse.status).toHaveBeenCalledWith(404);

        });
    });

});


