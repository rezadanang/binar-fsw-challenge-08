const AuthenticationController = require('./AuthenticationController');
const { EmailNotRegisteredError, InsufficientAccessError, WrongPasswordError} = require('../errors');
const User = {};
const { JWT_SIGNATURE_KEY } = require('../../config/application');
const { Role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mockUser = {
    id: 1,
    name: 'testuser',
    email: 'testuser@mail.com',
    password: 'testuser123',
    image: 'test.jpg',
    roleId: 1
};

mockUser.encryptedPassword = bcrypt.hashSync(mockUser.password, 10);

const mockRole = {
    id: 1,
    name: 'COSTUMER'
};

const defaultMockResponse = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    encryptedPassword: mockUser.encryptedPassword,
    roleId: mockRole.id,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockRoleModel = {
    findOne: jest.fn().mockReturnValue(mockRole),
};

const mockUserModel = {
    findOne: jest.fn().mockReturnValue(null),
    create: jest.fn().mockReturnValue(defaultMockResponse),
};

describe('AuthenticationController', () => {

    describe('authorize', () => {
        it('should run next function if token and role valid', async () => {
            const roleTestModel = Role;
            const userTestModel = User;
            const controller = new AuthenticationController({
                roleTestModel, userTestModel, bcrypt, jwt
            });
            const mockToken = controller.createTokenFromUser(mockUser, mockRole);
            const mockRequest = {
                headers: {
                    authorization: 'Bearer ' + mockToken
                },
            };
            const mockNext = jest.fn();

            const authorizeCustomer = controller.authorize('COSTUMER');
            await authorizeCustomer(mockRequest, {}, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should response status 401 if token valid but role user invalid', async () => {
                const roleTestModel = Role;
                const userTestModel = User;
                const controller = new AuthenticationController({
                    roleTestModel, userTestModel, bcrypt, jwt
                });
                const mockToken = controller.createTokenFromUser(mockUser, mockRole);
                const mockRequest = {
                    headers: {
                        authorization: 'Bearer ' + mockToken,
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const authorizeCustomer = controller.authorize('ADMIN');
                await authorizeCustomer(mockRequest, mockResponse, mockNext);
                const err = new InsufficientAccessError('COSTUMER');
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: {
                        name: err.name,
                        message: err.message,
                        details: err.details || null,
                    },
                });
            });

        it('should response status 401 with error if false token', async () => {
                const roleTestModel = Role;
                const userTestModel = User;
                const controller = new AuthenticationController({
                    roleTestModel, userTestModel, bcrypt, jwt
                });
                const mockToken = controller.createTokenFromUser(mockUser, mockRole);
                const mockReq = {
                    headers: {
                        authorization: 'Bearer ' + mockToken + 'zzz',
                    },
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const authorizeCustomer = controller.authorize('ADMIN');
                await authorizeCustomer(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(401);
            });
    });

    describe('#handleLogin', () => {
        it('should response status 201 and return access token when logged in', async () => {
                const mockRequest = {
                    body: {
                        email: mockUser.email,
                        password: mockUser.password
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockReturnValue({
                        ...defaultMockResponse,
                        Role: mockRole
                    }),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt
                });

                await controller.handleLogin(mockRequest, mockResponse, mockNext);
                const expectedToken = controller.createTokenFromUser(
                    { ...defaultMockResponse, Role: mockRole }, mockRole,
                );

                expect(mockUserModel.findOne).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    accessToken: expectedToken,
                });
            });

        it('should response status 404 and return error if email not registered', async () => {
                const mockRequest = {
                    body: {
                        email: mockUser.email,
                        password: mockUser.password,
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockReturnValue(null),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt
                });

                await controller.handleLogin(mockRequest, mockResponse, mockNext);

                const expectedErr = new EmailNotRegisteredError(mockUser.email);

                expect(mockUserModel.findOne).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(mockResponse.json).toHaveBeenCalledWith(expectedErr);
            });

        it('should response status 401 and return error if password incorrect', async () => {
                const mockRequest = {
                    body: {
                        email: mockUser.email,
                        password: 'pass1238'
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockReturnValue({
                        ...defaultMockResponse,
                        Role: mockRole,
                    }),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt,
                });

                await controller.handleLogin(mockRequest, mockResponse, mockNext);

                const expectedErr = new WrongPasswordError();

                expect(mockUserModel.findOne).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.json).toHaveBeenCalledWith(expectedErr);
            });

        it('should run next function on general error', async () => {
                const mockRequest = {
                    body: {
                        email: mockUser.email,
                        password: 'pass123',
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockRejectedValue(new Error('whatev')),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt,
                });

                await controller.handleLogin(mockRequest, mockResponse, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });
    });

    describe('#handleRegister', () => {
        it('should return response status 201 and token request is valid', async () => {
                const mockRequest = {
                    body: {
                        name: mockUser.name,
                        email: mockUser.email,
                        password: mockUser.password
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt
                });

                await controller.handleRegister(
                    mockRequest, mockResponse, mockNext
                );

                const expectedToken = controller.createTokenFromUser(
                    defaultMockResponse, mockRole
                );

                expect(mockUserModel.create).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    accessToken: expectedToken
                });
            },
        );

        it('should return response status 422 and return error if email already registered', async () => {
                const mockRequest = {
                    body: {
                        name: mockUser.name,
                        email: mockUser.email,
                        password: mockUser.password
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                };
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockReturnValue(true)
                };
                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt
                });

                await controller.handleRegister(
                    mockRequest, mockResponse, mockNext,
                );

                const expectedErr = new EmailAlreadyTakenError(mockUser.email);

                expect(mockUserModel.findOne).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(422);
                expect(mockResponse.json).toHaveBeenCalledWith(expectedErr);
            },
        );

        it('should go to next function to handle general error', async () => {
                const mockRequest = {
                    body: {
                        name: mockUser.name,
                        email: mockUser.email,
                        password: mockUser.password
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                };
                const mockNext = jest.fn();

                const mockUserModel = {
                    findOne: jest.fn().mockRejectedValue(
                        new Error('error')
                    ),
                };
                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt,
                    jwt
                });

                await controller.handleRegister(
                    mockRequest, mockResponse, mockNext
                );

                expect(mockNext).toHaveBeenCalled();
            },
        );
    });
    
    describe('#createTokenFromUser', () => {
        it('should return true token based with user data', () => {
            const userModel = User;
            const roleModel = Role;
            const controller = new AuthenticationController({
                userModel, roleModel, bcrypt, jwt
            });
            const token = controller.createTokenFromUser(mockUser, mockRole);
            const expectedToken = jwt.sign({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                image: mockUser.image,
                role: {
                    id: mockRole.id,
                    name: mockRole.name
                }
            }, JWT_SIGNATURE_KEY);

            expect(token).toEqual(expectedToken);
        });
    });

    describe('#decodeToken', () => {
        it('should return user data after validate token', () => {
            const mockUser = {
                id: 66,
                name: 'something',
                email: 'something@mail.com',
                image: 'something.jpg',
                role: {
                    id: 2,
                    name: 'ADMIN'
                },
            };
            const userModel = User;
            const roleModel = Role;
            const mockToken = jwt.sign(mockUser, JWT_SIGNATURE_KEY);
            const controller = new AuthenticationController({
                userModel, roleModel, bcrypt, jwt
            });

            const decodeResult = controller.decodeToken(mockToken);
            delete decodeResult['iat'];
            expect(decodeResult).toEqual(mockUser);
        });
    });

    describe('#encryptPassword', () => {
        it('should return hashed password', () => {
            const mockPassword = 'test123';
            const roleModel = Role;
            const userModel = User;
            const controller = new AuthenticationController({
                userModel, roleModel, bcrypt, jwt
            });
            const hashResult = controller.encryptPassword(mockPassword);
            expect(bcrypt.compareSync(mockPassword, hashResult)).toEqual(true);
        });
    });

    describe('#verifyPassword', () => {
        it('should return hash character and password is matched', () => {
            const mockPassword = 'test123';
            const mockHashPassword = bcrypt.hashSync(mockPassword, 10);
            const userModel = User;
            const roleModel = Role;
            const controller = new AuthenticationController({
                userModel, roleModel, bcrypt, jwt
            });

            const result = controller.verifyPassword(mockPassword, mockHashPassword);
            expect(result).toEqual(true);
        });

        it('should return hash character andd password is not matched', () => {
            const mockPassword = 'test123';
            const mockHashPassword = bcrypt.hashSync(mockPassword + '456', 10);
            const userModel = User;
            const roleModel = Role;
            const controller = new AuthenticationController({
                userModel, roleModel, bcrypt, jwt
            });

            const result = controller.verifyPassword(mockPassword, mockHashPassword);
            expect(result).toEqual(false);
        });
    });
   
    describe('#handleGetUser', () => {
        it('should response status 200 and return user data', async () => {
            const mockRequest = {
                user: mockUser,
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const mockUserModel = {
                findByPk: jest.fn().mockReturnValue(mockUser),
            };
            const mockRoleModel = {
                findByPk: jest.fn().mockReturnValue(true),
            };

            const controller = new AuthenticationController({
                userModel: mockUserModel,
                roleModel: mockRoleModel, bcrypt, jwt
            });

            await controller.handleGetUser(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
            
        });

        it('should response status 404 with error if user not found', async () => {
                const mockRequest = {
                    user: mockUser,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };

                const mockUserModel = {
                    findByPk: jest.fn().mockReturnValue(false),
                };
                const mockRoleModel = {
                    findByPk: jest.fn().mockReturnValue(false),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt, jwt,
                });

                await controller.handleGetUser(mockRequest, mockResponse);
                const expectedErr = new RecordNotFoundError(mockUser.name);

                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(mockResponse.json).toHaveBeenCalledWith(expectedErr);
        });

        it('should response status 404 with error if role user not found', async () => {
                const mockRequest = {
                    user: mockUser,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(''),
                };

                const mockUserModel = {
                    findByPk: jest.fn().mockReturnValue(true),
                };
                const mockRoleModel = {
                    findByPk: jest.fn().mockReturnValue(false),
                };

                const controller = new AuthenticationController({
                    userModel: mockUserModel,
                    roleModel: mockRoleModel,
                    bcrypt, jwt,
                });

                await controller.handleGetUser(mockRequest, mockResponse);
                const expectedErr = new RecordNotFoundError(mockUser.name);

                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(mockResponse.json).toHaveBeenCalledWith(expectedErr);
        });
    });
});