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
exports.User = void 0;
var typeorm_1 = require("typeorm");
var nurse_entity_1 = require("./nurse.entity");
var bson_typings_1 = require("typeorm/driver/mongodb/bson.typings");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
        __metadata("design:type", bson_typings_1.UUID)
    ], User.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return nurse_entity_1.Nurse; }, { eager: true, nullable: false }),
        (0, typeorm_1.JoinColumn)({ name: 'nurseId' }),
        __metadata("design:type", nurse_entity_1.Nurse)
    ], User.prototype, "nurse", void 0);
    __decorate([
        (0, typeorm_1.Column)({ nullable: false, unique: true }),
        (0, typeorm_1.Index)("idx_username_hash", { unique: true }),
        __metadata("design:type", String)
    ], User.prototype, "username", void 0);
    __decorate([
        (0, typeorm_1.Column)({ nullable: false }),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    User = __decorate([
        (0, typeorm_1.Entity)()
    ], User);
    return User;
}());
exports.User = User;
