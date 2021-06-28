import React from 'react';
import { Editor } from 'slate'
import { useSlateStatic } from 'slate-react'

export default function(props) {
  // const editor  = useSlateStatic();
  const editor  = props.editor;
  const handleClick = (e) => {
  console.log(editor)

    e.preventDefault();
    let marks = Editor.marks(editor)
    console.log(marks);
    if(!marks || !marks['bold']) editor.addMark('bold', true)
    else {
      editor.removeMark('bold')
    }
  }
  return (
    <span onMouseDown={handleClick}>bold</span>
  )
}