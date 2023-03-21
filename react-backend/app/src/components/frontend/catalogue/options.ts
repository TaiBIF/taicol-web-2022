export type Option = {
  value: string;
  label: string;
}

export type ClassificationOption = {bold?:boolean} & Option

export const redCategories: Option[] = [
  { value: 'NEX', label: 'EX' },
  { value: 'NEW', label: 'EW' },
  { value: 'NRE', label: 'RE' },
  { value: 'NCR', label: 'CR' },
  { value: 'NEN', label: 'EN' },
  { value: 'NVU', label: 'VU' },
  { value: 'NNT', label: 'NT' },
  { value: '1NLC', label: 'LC' },
  { value: 'NDD', label: 'DD' },
  { value: 'NA', label: 'NA' },
  { value: 'NE', label: 'NE' },
]


export const citesRefs: Option[] = [
  { value: 'NC', label: '非管制' },
  { value: '1', label: '附錄一' },
  { value: '2', label: '附錄二' },
  { value: '3', label: '附錄三' },
]

export const protectedCategories: Option[] = [
  { value: 'none', label: '無' },
  { value: 'I', label: '第一級' },
  { value: 'II', label: '第二級' },
  { value: 'III', label: '第三級' },
]

export const habitats: Option[] = [
  { value: 'is_terrestrial', label: '陸生' },
  { value: 'is_freshwater', label: '淡水' },
  { value: 'is_brackish', label: '半鹹水' },
  { value: 'is_marine', label: '海洋' },
]

export const alienTypes: Option[] = [
  { value: 'native', label: '原生' },
  { value: 'naturalized', label: '歸化' },
  { value: 'invasive', label: '入侵' },
  { value: 'cultured', label: '栽培豢養' },
]

export const classificationHierarchies: ClassificationOption[] = [
  { value: 'none', label: '' },
  { value: '34', label: '種',bold: true },
  { value: '35', label: '亞種' },
  { value: '37', label: '變種' },
  { value: '40', label: '型' },
  { value: '38', label: '亞變種' },
  { value: '36', label: '雜交亞種' },
  { value: '39', label: '雜交變種' },
  { value: '42', label: '特別品型' },
  { value: '30', label: '屬',bold: true },
  { value: '31', label: '亞屬' },
  { value: '32', label: '組|節' },
  { value: '33', label: '亞組|亞節' },
  { value: '26', label: '科',bold: true },
  { value: '27', label: '亞科' },
  { value: '28', label: '族' },
  { value: '29', label: '亞族' },
  { value: '22', label: '目',bold: true },
  { value: '23', label: '亞目' },
  { value: '24', label: '下目' },
  { value: '25', label: '超科|總科' },
  { value: '18', label: '綱' ,bold: true},
  { value: '19', label: '亞綱' },
  { value: '20', label: '下綱' },
  { value: '21', label: '超目|總目' },
  { value: '12', label: '門' ,bold: true},
  { value: '14', label: '下門' },
  { value: '15', label: '微門' },
  { value: '16', label: '小門' },
  { value: '17', label: '超綱|總綱' },
  { value: '7', label: '部|類' ,bold: true},
  { value: '8', label: '亞部|亞類' },
  { value: '9', label: '下部|下類' },
  { value: '10', label: '小部|小類' },
  { value: '11', label: '超門|總門' },
  { value: '3', label: '界' ,bold: true },
  { value: '4', label: '亞界' },
  { value: '5', label: '下界' },
  { value: '6', label: '超部|總部' },
  { value: '1', label: '域' ,bold: true},
  { value: '2', label: '總界' },
]
