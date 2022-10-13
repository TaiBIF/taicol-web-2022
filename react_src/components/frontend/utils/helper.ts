import type {SourceProps} from '../types'
export const formatNumber = (num: number): string => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
};

export const shortDescription = (description: string,max:number): string => {
  return description.replace(/(<([^>]+)>)/gi, "").substring(0, max) + (description.length > 100 ? '...' : '')
}

export const capitalize = (s:string):string => {
   return s ? s[0].toUpperCase() + s.slice(1) : ''
}

export const getTotal = (data:(string|number)[][]) => {
  return data.reduce((a, b): number => {
    const count = b[1] as number
    const total = a + count
    return total
  }, 0)
}

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<any> {
  const res = await fetch(input, init)
  return res.json()
}