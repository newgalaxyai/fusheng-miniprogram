export type ICorpInfoRequest = {
    gid: number
    pageNum?: number
    pageSize?: number
}

export type ICorpInfoResponse<T> = {
    total: number
    result: T[]
    list: T[]
}

export type IPaginationRequest = {
    pageNo: number // 页码
    pageSize: number // 每页数量
}

export type IPaginationResponse<T> = {
    list: T[] // 列表
    total: number // 总数量
}

export type IGetDetailRequest = {
    id: number
}
