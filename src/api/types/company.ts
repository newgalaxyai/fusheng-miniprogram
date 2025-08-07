// 请求参数
export type IBusinessInfoRequest = {
    keyword: string; // 企业名称
}

// 工商信息
export type IBusinessInfo = {
    legalPerson: string; // 法人
    establishTime: string; // 成立时间
    regStatus: string; // 注册状态
    regCapital: string; // 注册资本
    regCapitalForList: string; // 实缴资本
    categoryNameLv1: string; // 一级分类
    categoryNameLv2: string; // 二级分类
    categoryNameLv3: string; // 三级分类
    creditCode: string; // 信用代码
    regNumber: string; // 注册号
    orgType: string; // 组织类型
    orgNumber: string; // 组织编号
    socialSecurityStaffNum: string; // 参保人数
    businessTerm: string; // 经营期限
    approveDate: string; // 核准日期
    registerInstitute: string; // 注册机构
    englishName: string; // 英文名称
    historyNames: string; // 历史名称
    businessScope: string; // 经营范围
}

// 股东信息
export type IShareholderInfo = {
    actualDate: string
    currentPosition: string
    logo: string
    percent: string
    serviceCount: string
    shareHolderName: string
    shareHolderTypeOnPage: string
    subscribedDate: string
    tags: {
        profileTagNameOnPage: string
    }[]
    totalActualCapital: string
    totalCapital: string
}

// 人员信息
export type IPersonInfo = {
    name: string; // 姓名
    typeJoin: string[]; // 职位
}

// 企业年报
export type IAnnualReport = {
    reportYear: string; // 报告年份
    releaseDate: string; // 发布日期
    id: number; // 年报id
}

// 企业年报详情请求参数
export type IAnnualReportDetailRequest = {
    reportId: number; // 年报id
    gid: number; // 企业id
}

// 基本信息
export type IBasicInfo = {
    companyName: string; // 公司名称
    creditCode: string; // 统一社会信用代码
    manageState: string; // 管理状态
    employeeNum: string; // 员工人数
    phoneNumber: string; // 联系电话
    netProfitMargin: string; // 是否有网站或网店
    email: string; // 邮箱
    postcode: string; // 邮政编码
    postalAddress: string; // 通信地址
    totalAssets: string; // 总资产
    totalSales: string; // 总销售额
    totalProfit: string; // 总利润
    totalTax: string; // 总税金
    retainedProfit: string; // 净利润
    totalLiability: string; // 总负债
    totalEquity: string; // 总权益
    primeBusProfit: string; // 主营业务利润
}

// 股东及出资信息
export type IShareholderAndInvestment = {
    alias: string
    cid: number
    clickId: string
    investorName: string
    logo: string
    paidAmount: string
    paidTime: string
    paidType: string
    reportYear: string
    serviceCount: string
    serviceType: string
    subscribeAmount: string
    subscribeTime: string
    subscribeType: string
    toco: string
    type: string
}

// 社保信息
export type ISocialSecurityInfo = {
    endowmentInsurance: string; // 城镇职工基本养老保险
    employmentInjuryInsurance: string; // 工伤保险
    unemploymentInsurance: string; // 失业保险
    maternityInsurance: string; // 生育保险
    medicalInsurance: string; // 职工基本医疗保险
    endowmentInsuranceBase: string; // 单位参加城镇职工基本养老保险缴费基数
    endowmentInsurancePayAmount: string; // 单位参加城镇职工基本养老保险缴费金额
    endowmentInsuranceOweAmount: string; // 单位参加城镇职工基本养老保险未缴金额
    unemploymentInsuranceBase: string; // 单位参加失业保险缴费基数
    unemploymentInsurancePayAmount: string; // 单位参加失业保险缴费金额
    unemploymentInsuranceOweAmount: string; // 单位参加失业保险未缴金额
    medicalInsuranceBase: string; // 单位参加职工基本医疗保险缴费基数
    medicalInsurancePayAmount: string; // 单位参加职工基本医疗保险缴费金额
    medicalInsuranceOweAmount: string; // 单位参加职工基本医疗保险未缴金额
    maternityInsuranceBase: string; // 单位参加生育保险缴费基数
    maternityInsurancePayAmount: string; // 单位参加生育保险缴费金额
    maternityInsuranceOweAmount: string; // 单位参加生育保险未缴金额
    employmentInjuryInsurancePayAmount: string; // 单位参加工伤保险缴费金额
    employmentInjuryInsuranceOweAmount: string; // 单位参加工伤保险未缴金额
}

// 企业年报详情
export type IAnnualReportDetail = {
    shareholderList: IShareholderAndInvestment[]; // 股东信息
    baseInfo: IBasicInfo; // 基本信息
    reportSocialSecurityInfo: ISocialSecurityInfo; // 社保信息
}

// 对外投资
export type IOutsideInvestment = {

}

// 分支机构
export type IBranchOffice = {

}

// 受益人
export type IActualController = {

}

// 直接控制企业
export type IDirectControl = {

}

// 工商自主公示
export type IBusibessPublicity = {

}
