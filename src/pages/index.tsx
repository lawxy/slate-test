
import React, { useEffect, useMemo, useState,useCallback, Children } from "react";
// Import the Slate editor factory.
import { createEditor, BaseEditor, Transforms, Editor} from 'slate'
import { ReactEditor,withReact, Slate, Editable } from 'slate-react'
import DeletePlugin from './plugins/delete-plugin';
import BoldPlugin from './plugins/bold-plugin'
type EditorType = BaseEditor & ReactEditor
// declare const withReact: <T extends ReactEditor>(editor: T) => T & ReactEditor;
// Import the Slate components and React plugin.
// import { Slate, Editable, withReact } from 'slate-react'
function pipe(editor) {
  return Array.from(arguments).slice(1).reduceRight((memo,fn) => {
    // console.log(fn.name)
    return fn(memo)
  }, editor)
}
// console.log('createEditor', createEditor())
export default function IndexPage() {
  // 创建一个不会在渲染中变化的 Slate 编辑器对象。
  // const editor = useMemo(() => withReact(createEditor()), []);
  const editor = useMemo(() => {
    return pipe(editor, withReact, DeletePlugin, createEditor)
  }, []);
    // 当设置 value 状态时，添加初始化值.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])
  const renderElement = useCallback(props => {
    let content = ''
    props.attributes = {
      ...props.attributes,
      'data-slate-node': true,
      'data-slate-inline': true
    }
    switch(props.element.type) {
      case 'text': 
      content = (
        <input
            type="text"
            checked={false}
            onChange={event => {
              const path = ReactEditor.findPath(editor, props.element)
              const newProperties = {
                value: event.target.value,
              }
              Transforms.setNodes(editor, newProperties, { at: path })
            }}
          />
      )
      break;
      case 'radio': 
      content = (
        <input
            type="radio"
          />
      )
      break;
    }
    return content ? (
      <span {...props.attributes}>
          <span
            contentEditable={false}
          >
            {content}
          </span>
          {props.children}
      </span>
      
    ) :(
      <div {...props.attributes}>
          {props.children}
      </div>
    )
  }, [])

  const renderLeaf = (props) => {
    // console.log(props)
    const style = {fontWeight: props.text.bold ? '900' : 'normal'}
    return (
      <span {...props.attributes} style={style}>
        {props.children}
      </span>
    )
  }
  const handleAdd = (type) => {
    return (e) => {
      e.preventDefault();
      Transforms.insertNodes(
        editor,
        { type, children: [{ text: '' }] },
      )
    }
  }
  return (
    <>
      <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
        <Editable renderElement={renderElement} renderLeaf={renderLeaf}/>
        <BoldPlugin editor={editor}/>
        <button onMouseDown={handleAdd('text')}>+text</button>
        <button onMouseDown={handleAdd('radio')}>+radio</button>
      </Slate>
    </>
  )
}
