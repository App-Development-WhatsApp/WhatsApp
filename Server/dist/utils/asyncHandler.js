"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
// This asyncHandler is a higher-order function that accepts a function as a parameter
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};
exports.asyncHandler = asyncHandler;
