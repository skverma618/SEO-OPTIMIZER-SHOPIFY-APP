export declare class PaginationDto {
    page?: number;
    limit?: number;
    search?: string;
}
export declare class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
