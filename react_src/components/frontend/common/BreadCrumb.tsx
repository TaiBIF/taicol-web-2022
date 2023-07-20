
import * as React from 'react';
import type { BreadCrumbProps } from '../types'
import { Translation } from 'react-i18next';

type Props = {
  breadcrumbs: BreadCrumbProps[]
}
const BreadCrumb: React.FC<Props> = (props) => {

  return (
    <div className="path">
      {props?.breadcrumbs?.map((breadCrumb: BreadCrumbProps, index: number) => {
        const key: string = `breadcrumb-${index}`
        const arrow: string = index == props.breadcrumbs.length - 1 ? ' ' : '>'
        return breadCrumb?.href ? <Translation>{t => <a key={key} href={breadCrumb.href}>{t(breadCrumb.title)}{arrow}</a> }</Translation> : <Translation>{t => <p key={key}>{t(breadCrumb.title)}{arrow}</p> }</Translation>
      })}
    </div>
  )
}

export default BreadCrumb
