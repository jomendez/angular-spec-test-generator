
import * as ts from 'typescript';

interface IMethodName {
  modifier: string;
  name: string;
}

export function getMethodsNames(filePath: string): IMethodName[] {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });
  const sourceFile = program.getSourceFile(filePath);
  const methodsLifecycles = ['ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'];
  const methodsToReturn = [];
  let modifier = 'public';

  ts.forEachChild(sourceFile, node => {
    if (ts.isClassDeclaration(node)) {
      for (const member of node.members) {
        if (ts.isMethodDeclaration(member)) {
          if (member && member.name) {
            if (member.modifiers && member.modifiers.length > 0 && member.modifiers.find(x => x.kind === 121)) { // kind 121 is private identifier
              modifier = 'private';
            } else {
              modifier = 'public';
            }
            methodsToReturn.push({name: (<any>member.name).escapedText, modifier});
          }
        }
      }
    }
  });
  return methodsToReturn.filter(x => !methodsLifecycles.includes(x.name));
}
