
import type { OptionProp,CategoryTypes } from 'src/types';
import type { CategoryDataProps, NewsListProps } from 'src/types';

export const getCategories = async (type:CategoryTypes):Promise<OptionProp[]> => {

  const res = await fetch(`/api/admin/category?type=${type}`)
  const result: CategoryDataProps[] = await res.json()
  const options = result.map(category => {
      return {label:category.name,value:category.id}
    })
  return Promise.resolve(options)
}
