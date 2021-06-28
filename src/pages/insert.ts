import {
  BaseElement,
  BaseRange,
  Transforms,
  BaseEditor,
  Editor,
  Selection,
  Path,
  Point,
  Node,
  Text,
  NodeMatch,
  Range,
} from 'slate';
export default function insertNodes<T extends Node>(
  editor: Editor,
  nodes: Node | Node[],
  options: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: 'highest' | 'lowest';
    hanging?: boolean;
    select?: boolean;
    voids?: boolean;
  } = {},
): void {
    Editor.withoutNormalizing(editor, () => {
      const { hanging = false, voids = false, mode = 'lowest' } = options;
      let { at, match, select } = options;
      // debugger;
      if (Node.isNode(nodes)) {
        nodes = [nodes];
      }

      if (nodes.length === 0) {
        return;
      }

      const [node] = nodes;

      // By default, use the selection as the target location. But if there is
      // no selection, insert at the end of the document since that is such a
      // common use case when inserting from a non-selected state.
      if (!at) {
        if (editor.selection) {
          at = editor.selection;
        } else if (editor.children.length > 0) {
          at = Editor.end(editor, []);
        } else {
          at = [0];
        }

        select = true;
      }

      if (select == null) {
        select = false;
      }
      if (Range.isRange(at)) {
        if (!hanging) {
          at = Editor.unhangRange(editor, at);
        }

        if (Range.isCollapsed(at)) {
          at = at.anchor;
        } else {
          const [, end] = Range.edges(at);
          const pointRef = Editor.pointRef(editor, end);
          Transforms.delete(editor, { at });
          at = pointRef.unref()!;
        }
      }

      if (Point.isPoint(at)) {
        if (match == null) {
          if (Text.isText(node)) {
            match = (n) => Text.isText(n);
          } else if (editor.isInline(node)) {
            match = (n) => Text.isText(n) || Editor.isInline(editor, n);
          } else {
            match = (n) => Editor.isBlock(editor, n);
          }
        }

        const [entry] = Editor.nodes(editor, {
          at: at.path,
          match,
          mode,
          voids,
        });

        if (entry) {
          const [, matchPath] = entry;
          const pathRef = Editor.pathRef(editor, matchPath);
          const isAtEnd = Editor.isEnd(editor, at, matchPath);
          debugger;
          Transforms.splitNodes(editor, { at, match, mode, voids });
          const path = pathRef.unref()!;
          at = isAtEnd ? Path.next(path) : path;
        } else {
          return;
        }
      }

      const parentPath = Path.parent(at);
      let index = at[at.length - 1];

      if (!voids && Editor.void(editor, { at: parentPath })) {
        return;
      }

      for (const node2 of nodes) {
        const path = parentPath.concat(index);
        index += 1;
        editor.apply({ type: 'insert_node', path, node2 });
      }

      if (select) {
        const point = Editor.end(editor, at);

        if (point) {
          Transforms.select(editor, point);
        }
      }
      resolve(at);
    });
}