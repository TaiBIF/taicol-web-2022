import next from 'next';
import React, { useState } from 'react';
import TaxonTree from 'src/pages/taxon/tree';
interface DeepArray<T> extends Array<T | DeepArray<T>> { }

type Deep<T> = T | DeepArray<T>;

type TaxonProps = {
  category?: string;
  name: string;
  stat: string;
  taxon_id: string;
  children:TaxonProps[]
}


const Taicol: React.VFC<TaxonProps> = (props) => {
  const { name, stat, taxon_id, category, children } = props;
  const [tree, setTree] = useState<TaxonProps>(props)

  const addSubTree = (taxon_id: string,subTree:TaxonProps,node:TaxonProps):TaxonProps => {
  let newSubTree:TaxonProps = node
    node.children.forEach((subNode:TaxonProps) => {
      const nextNode = addSubTree(node.taxon_id, subTree, subNode)

      if (nextNode && nextNode.taxon_id == taxon_id) {
        newSubTree.children.push(subTree)
      }
    })

    if (node && node.taxon_id == taxon_id) {
      newSubTree.children.push(subTree)
    }

    return newSubTree;
  }

  const onClick = (taxon_id:string): void => {
    const subTree = { name: 'abc', stat: '123', taxon_id: '123', children: [{ name: 'abc123', stat: '123123', taxon_id: '123123',children:[] }] }
    setTree(addSubTree(taxon_id, subTree, tree))
    console.log('tree',tree)
  }

  return (
    <li>
      <span className="anchor" id="t024279"></span>
      <div className="item-box" data-fetched="0" data-taxon="t024279" data-rank="3">
        <div className="cir-box">
          {category}
        </div>
        <h2>{name}</h2>
        <p>{stat}</p>
        <div className="arr" onClick={() => onClick('test')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
            <g id="tree-arr" transform="translate(-1545.086 -550.086)">
              <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" strokeLinecap="round" strokeWidth="2"></line>
              <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" strokeLinecap="round" strokeWidth="2"></line>
            </g>
          </svg>
        </div>
      </div>
    </li>
  )
}

export default Taicol
