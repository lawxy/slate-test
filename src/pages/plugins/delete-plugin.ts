import {Range} from 'slate'
const DeletePlugin = (editor) => {
  const { deleteBackward, isInline } = editor;
  editor.deleteBackward = function(unit) {
    const { selection } = editor;
    // Range.isCollapsed(selection)
    // console.log(selection)
    deleteBackward(unit)
  }
  editor.isInline = (element) => {
    // console.log('element.type', ['text', 'radio'].includes(element.type as string))
    return ['text', 'radio'].includes(element.type as string) ? true : isInline(element);
  };
  return editor;
}
export default DeletePlugin