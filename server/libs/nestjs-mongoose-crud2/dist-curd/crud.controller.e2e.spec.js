"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const mongoose = require("mongoose");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const crud_decorator_1 = require("./crud.decorator");
const DB = process.env.DB || "mongodb://localhost/nestjs-mongoose-crud-test-e2e";
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
const UserModel = mongoose.model("User", new mongoose.Schema({
    username: String,
    age: Number
}, {
    timestamps: true
}));
describe("CrudController e2e", () => {
    let UserController = class UserController {
        constructor() {
            this.model = UserModel;
        }
    };
    UserController = __decorate([
        crud_decorator_1.Crud({
            model: UserModel
        }),
        common_1.Controller('/users'),
        __metadata("design:paramtypes", [])
    ], UserController);
    let app;
    let totalUsers = 57;
    beforeAll(async () => {
        await UserModel.deleteMany({});
        const users = Array(totalUsers)
            .fill(1)
            .map((v, i) => ({
            username: `user${i}`,
            age: Math.floor(Math.random() * 100)
        }));
        await UserModel.insertMany(users);
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [UserController]
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(() => {
        mongoose.disconnect();
    });
    describe("create", () => {
        it("should return paginated users", async () => {
            return request(app.getHttpServer())
                .get(`/users?query={"limit":8}`)
                .expect(200)
                .expect(res => expect(res.body.data.length).toBe(8));
        });
        // end of it()
    });
});
