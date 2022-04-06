
import chalk from 'chalk';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export function getDecoratorMetadata(currentPath: string): [string, Record<string, any>] {
  const program = ts.createProgram([currentPath], {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });
  const sourceFile = program.getSourceFile(currentPath);
  const decoratorObj = {};
  let moduleName = '';
  ts.forEachChild(sourceFile, node => {
    if (ts.isClassDeclaration(node)) {
      moduleName = node.name.escapedText.toString();
      if (node.decorators && node.decorators.length > 0) {
        for (const decorator of node.decorators) {
          if (decorator.expression && (<any>decorator.expression).arguments && (<any>decorator.expression).arguments.length > 0) {
            const astModuleArguments = (<any>decorator.expression).arguments;
            const decoratorArguments = astModuleArguments.filter(x => x.kind === ts.SyntaxKind.ObjectLiteralExpression);
            if (decoratorArguments && decoratorArguments.length > 0) {
              for (const argument of decoratorArguments) {
                if (argument.properties && argument.properties.length > 0) {
                  for (const property of argument.properties) {
                    decoratorObj[property.name.escapedText] = property.initializer.elements.map(x => x.escapedText);
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  return [moduleName, decoratorObj];
}

export function findModuleClassNameInParentFolderRecursively(currentPath: string, className: string, parent = ''): [string, string] {
  if (currentPath) {
    const dirArr = path.resolve(currentPath, parent).split(path.sep);
    const currentDir = path.resolve(currentPath, parent);
    const currentDirectoryName = dirArr[dirArr.length - 1];

    // base case
    if (currentDirectoryName === 'src' || !dirArr.includes('src')) {
      return ['', ''];
    }

    const files = fs.readdirSync(dirArr.join(path.sep));
    if (files && files.length > 0) {
      const modulesFileNames = files.filter(x => x.includes('.module.ts'));
      if (!modulesFileNames || modulesFileNames.length === 0) {
        parent = '../' + parent;
        return findModuleClassNameInParentFolderRecursively(currentPath, className, parent);
      }
      for (const moduleFileName of modulesFileNames) {
        const [moduleName, decoratorMetadata] = getDecoratorMetadata(path.join(currentDir, moduleFileName));
        for (const key of Object.keys(decoratorMetadata)) {
          const found = decoratorMetadata[key].some(x => x === className);
          if (found) {
            return [parent + moduleFileName, moduleName];
          }
        }
      }
      parent = '../' + parent;
      return findModuleClassNameInParentFolderRecursively(currentPath, className, parent);
    }
  }
}
