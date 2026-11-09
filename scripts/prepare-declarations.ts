import { cp, readFile, readdir, writeFile } from 'node:fs/promises';
import ts from 'typescript';

const esm = new URL('../dist/types/esm/', import.meta.url);
// Explicit .js specifiers let NodeNext consumers resolve emitted .vue.d.ts files.
for (const entry of await readdir(esm, { recursive: true })) {
  if (!entry.endsWith('.d.ts')) continue;
  const file = new URL(entry, esm);
  const content = await readFile(file, 'utf8');
  const source = ts.createSourceFile(
    entry,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const result = ts.transform(source, [
    (context) => {
      const visit: ts.Visitor = (node) => {
        // vue-tsc expands DefineComponent's current trailing internal generics.
        // Keep props, emits and defaults; let Vue supply its version's defaults
        // for later generics so published types also work with Vue 3.5.0.
        if (
          ts.isImportTypeNode(node) &&
          node.qualifier?.getText(source) === 'DefineComponent' &&
          node.typeArguments &&
          node.typeArguments.length > 12
        ) {
          return ts.factory.updateImportTypeNode(
            node,
            node.argument,
            node.attributes,
            node.qualifier,
            node.typeArguments.slice(0, 12),
            node.isTypeOf,
          );
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    },
  ]);
  const declaration = ts.createPrinter().printFile(result.transformed[0]);
  result.dispose();
  await writeFile(
    file,
    declaration.replace(/(['"])([^'"\n]+)\.vue\1/g, '$1$2.vue.js$1'),
  );
}
// Identical declarations, with separate module scopes for each runtime format.
await cp(esm, new URL('../dist/types/cjs/', import.meta.url), {
  recursive: true,
});
await writeFile(
  new URL('../dist/types/cjs/package.json', import.meta.url),
  '{"type":"commonjs"}\n',
);
