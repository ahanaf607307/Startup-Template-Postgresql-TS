import { AppError } from "../errorHelper/appError.js";

class DevBuildError extends AppError {
    constructor(message: string, statusCode: number) {
        super(statusCode, message);
    }
}

export default DevBuildError;