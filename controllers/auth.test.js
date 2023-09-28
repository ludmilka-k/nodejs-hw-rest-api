import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js"

const { DB_HOST_TEST, PORT = 3000 } = process.env;

describe("test registration controller", () => {
    let server = null;

    beforeAll(async () => {
        await mongoose.connect(DB_HOST_TEST);
        server = app.listen(PORT);
    })
    afterAll(async() => {
        await mongoose.connection.close();
        server.close();
    })
    // beforeEach(async () => {
    //
    // })
    afterEach(async () => {
        await User.deleteMany();
    })

    test("test registration with new user", async () => {
        const registerData = {
            "email": "poly@qw.com",
            "password": "333333"
        }
        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(201);
        expect(body.email).toBe(registerData.email);
        expect(body.subscription).toBe('starter');
        expect(body.avatarURL).toEqual(expect.any(String));

        const user = await User.findOne({email: registerData.email});
        expect(user.email).toBe(registerData.email);
        expect(user.password).toEqual(expect.any(String));
        expect(user.avatarURL).toEqual(expect.any(String));
        expect(user.subscription).toBe('starter');
        expect(user.token).toBe('');
    })

    test("test registration with existing user", async () => {
        const registerData = {
            "email": "poly@qw.com",
            "password": "333333"
        }
        await User.create({email: registerData.email, password: '123456'})

        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(409);
        expect(body.message).toBe("Email already exist");
    })

    test("test registration with missing email", async () => {
        const registerData = {
            "password": "333333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"email\" is required");
    })

    test("test registration with missing password", async () => {
        const registerData = {
            "email": "poly@qw.com"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"password\" is required");
    })

    test("test registration with invalid email", async () => {
        const registerData = {
            "email": "poly.qw.com",
            "password": "333333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toMatch(/email.+fails to match the required pattern:/);
    })

    test("test registration with invalid password", async () => {
        const registerData = {
            "email": "poly@qw.com",
            "password": "333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/register")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"password\" length must be at least 6 characters long");
    })
})

describe("test login controller", () =>{
    let server = null;

    beforeAll(async () => {
        await mongoose.connect(DB_HOST_TEST);
        server = app.listen(PORT);
    })

    afterAll(async() => {
        await mongoose.connection.close();
        server.close();
    })

    beforeEach(async () => {
    })

    afterEach(async () => {
        await User.deleteMany();
    })

    test("test login with existing user", async() => {
        const loginData = {
            "email": "kiwi@qw.com",
            "password": "444444"
        }
        await request(app)
            .post("/api/auth/register")
            .send(loginData);

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(loginData);
        expect(statusCode).toBe(200);
        expect(body.token).toBeDefined();

        const user = await User.findOne({email: loginData.email});
        expect(user.email).toBe(loginData.email);
        expect(user.token).toBe(body.token);
    })

    test("test login with not existing user", async() => {
        const loginData = {
            "email": "kiwi@qw.com",
            "password": "444444"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(loginData);
        expect(statusCode).toBe(401);
        expect(body.message).toBe("Email or password invalid");
    })

    test("test login with not matching password", async() => {
        const loginData = {
            "email": "kiwi@qw.com",
            "password": "444444"
        }
        await request(app)
            .post("/api/auth/register")
            .send(loginData);

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send({...loginData, password: "invalidPassword"});
        expect(statusCode).toBe(401);
        expect(body.message).toBe("Email or password invalid");
    })

    test("test login with missing email", async () => {
        const registerData = {
            "password": "333333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"email\" is required");
    })

    test("test login with missing password", async () => {
        const registerData = {
            "email": "poly@qw.com"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"password\" is required");
    })

    test("test login with invalid email", async () => {
        const registerData = {
            "email": "poly.qw.com",
            "password": "333333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toMatch(/email.+fails to match the required pattern:/);
    })

    test("test login with invalid password", async () => {
        const registerData = {
            "email": "poly@qw.com",
            "password": "333"
        }

        const {statusCode, body} = await request(app)
            .post("/api/auth/login")
            .send(registerData);
        expect(statusCode).toBe(400);
        expect(body.message).toBe("\"password\" length must be at least 6 characters long");
    })
});

