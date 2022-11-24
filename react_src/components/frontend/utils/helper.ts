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
export const timeout = (delay:number) => {
    return new Promise( res => setTimeout(res, delay) );
}

export const replaceIp = (str: string, replaceStr: string) => {
  const regex = /[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+/g
  console.log('replaceIp',str.replace(regex,replaceStr))
  return str.replace(regex,replaceStr)
}

export const replaceDomain = (str:string,replaceStr:string) => {
  const regex = /[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(:\d+)?/g
  return str.replace(regex,replaceStr)
}
