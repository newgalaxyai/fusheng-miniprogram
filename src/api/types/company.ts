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
    name: string; // 公司名称
    alias: string; // 别名
    logo: string; // logo
    tags: {
        name: string
    }[];
    legalPersonName: string; // 法定代表人
    amount: string; // 注册资本
    percent: string; // 出资比例
    estiblishTime: number; // 成立时间
    regStatus: string; // 注册状态
    province: string; // 省份
    category: string; // 行业
}

// 分支机构
export type IBranchOffice = {
    name: string; // 公司名称
    alias: string; // 别名
    logo: string; // logo
    tags: {
        name: string
    }[];
    regStatus: string; // 注册状态
    legalPersonName: string; // 法定代表人
    area: string; // 注册地址
    estiblishTime: string; // 成立时间
}

// 受益所有人
export interface IBeneficialList {
    humanName: string; // 姓名
    humanLogo: string; // logo
    positionType: string; // 职位类型
    finalBenefitShare: string; // 最终受益比例
    benefitType: string; // 受益类型
    decisionReason: string; // 决策原因
}

// 受益人
export type IActualController = {
    beneficialHumanList: IBeneficialList[]; // 受益自然人
    beneficialOwnerList: IBeneficialList[]; // 受益所有人
}

// 直接控制企业
export type IDirectControl = {
    area: string; // 注册地址
    companyAlias: string; // 公司别名
    companyGid: number; // 公司id
    companyLogo: string; // 公司logo
    companyName: string; // 公司名称
    establishDate: string; // 成立日期
    id: number; // 直接控制企业id
    industry: string; // 行业
    industryInfo: {
        nameLevel1: string; // 一级行业
        nameLevel2: string; // 二级行业
        nameLevel3: string; // 三级行业
        nameLevel4: string; // 四级行业
        code: string; // 行业代码
    }; // 行业信息
    code: string; // 行业代码
    nameLevel1: string; // 一级行业
    nameLevel2: string; // 二级行业
    nameLevel3: string; // 三级行业
    nameLevel4: string; // 四级行业
    investRatio: string; // 出资比例
    legalPersonGid: number; // 法人GID
    legalPersonHid: number; // 法人HID
    legalPersonName: string; // 法人姓名
    legalPersonType: number; // 法人类型
    registerCapital: string; // 注册资本
    registerStatus: string; // 注册状态
}

// 工商自主公示
export type IBusibessPublicity = {
    alias: string; // 别名
    logo: string; // logo
    name: string; // 公司名称
    capital:{
        amomon: string; // 金额
        publicDate: string; // 公示日期
        time: string; // 时间
    }[]; // 资本信息
    capitalActl:{
        amomon: string; // 金额
        time: string; // 时间
    }[]; // 资本信息
}

// 疑似关系
export type ISuspectedRelation = {
    alias: string; // 别名
    logo: string; // logo
    companyName: string; // 公司名称
    suspectedTypeText: string; // 关系类型
    regStatus: string; // 注册状态
    legalPerson: {
        legalRepName: string; // 法定代表人
    }[]; // 法定代表人
    regCapital: string; // 注册资本
    establishYearsShowText: string; // 成立时间
    phoneList: {
        phone: string; // 手机号
    }[]; // 手机号
    emailList: {
        email: string; // 邮箱
    }[]; // 邮箱
    addressList: {
        address: string; // 地址
    }[]; // 地址
}

// 企业报告
export type IGenerateCorpReportRequest = {
  creditCode: string
  targetCompanyName: string
  targetCompanyServe: string
  enterpriseAnalysisBack: string | null
}
export type ICorpReportContent = {
  title: string
  content: string
}
export type ICorpReport = {
  summary_task: ICorpReportContent
  base_task: ICorpReportContent
  product_task: ICorpReportContent
  risk_task: ICorpReportContent
  development_task: ICorpReportContent
  innovation_task: ICorpReportContent
  analysis_task: ICorpReportContent
}
export type IGenerateCorpReportResponse = {
  id: number // 报告id
  content: string
}

// 企业联系方式请求参数
export type IGetCorpContactInfoRequest = {
  creditCode: string // 社会信用代码
}
// 联系人信息
export type ICorpContactInfo = {
  name: string // 联系人名称
  position: string // 联系人职务
  phone: string // 联系人手机号
  type: number // 类型 1.固定电话 2.业务人员
  recommend: boolean // 是否推荐
}
// 获取企业联系方式响应
export type IGetCorpContactInfoResponse = {
  fixedPhones: ICorpContactInfo[] // 固定电话
  businessPeople: ICorpContactInfo[] // 业务人员
}
