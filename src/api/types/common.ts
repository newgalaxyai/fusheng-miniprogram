export type ICorpInfoRequest = {
    gid: number
}

export type ICorpInfoResponse<T> = {
    total: number
    result: T[]
}
