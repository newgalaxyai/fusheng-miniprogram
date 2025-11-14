interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 详细的校验结果
 */
export function validateTextAndCommaDetailed(text: string): ValidationResult {
  const errors: string[] = []

  // 基础字符校验
  const invalidChars = text.split('').filter(char => {
    // 检查是否为非文字、非空格、非英文逗号的字符
    const charRegex = /^[\p{L}\d\s,]+$/u
    return !charRegex.test(char)
  })

  if (invalidChars.length > 0) {
    errors.push(`只能输入文字、数字、英文字母，以及英文逗号`)
  }

  // 连续逗号检查
  if (text.includes(',,')) {
    errors.push('不能包含连续逗号')
  }

  // 开头逗号检查
  if (text.startsWith(',')) {
    errors.push('不能以逗号开头')
  }

  // 结尾逗号检查
  if (text.endsWith(',')) {
    errors.push('不能以逗号结尾')
  }

  // 只有逗号检查
  if (text.replace(/,/g, '').trim().length === 0) {
    errors.push('不能只包含逗号')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
