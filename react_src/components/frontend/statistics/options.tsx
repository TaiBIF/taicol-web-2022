export type CompareType = 'kingdom_compare' | 'plantae_compare' | 'animalia_compare' | 'arthropoda_compare' | 'chordata_compare'

export type OptionProp = {
  value: CompareType;
  label: string | number | React.ReactNode ;
}

export const speciesOptions:OptionProp[] = [
  {value:'kingdom_compare',label:'各界比較'},
  {value:'plantae_compare',label:'植物界比較'},
  {value:'animalia_compare',label:'動物界比較'},
  {value:'arthropoda_compare',label:'節肢動物門比較'},
  {value:'chordata_compare',label:'脊索動物門比較'}
]

export default {
  speciesOptions,
}