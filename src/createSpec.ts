import * as fs from 'fs';
import * as path from 'path';
import * as format from 'string-template';
import { getMethodsNames } from './findAllMethods';
import { findModuleClassNameInParentFolderRecursively } from './findModule';
const chalk = require('chalk');

export interface SpecType {
  type: string;
  name: string;
  dir: string;
  url: string;
}

const templatePath = 'template-ng-mocks';

export const createSpec = async (array: SpecType[], isforce: boolean) => {
  for (const file of array) {
    const targetUrl = path.join(file.dir, `${file.name}.spec.ts`);

    const pathComp = path.join(file.dir, `${file.name}.ts`);
    const templateItFromMethods = generateItForEachMethod(pathComp);

    if (!fs.existsSync(targetUrl) || isforce) {
      const template = fs.readFileSync(
        path.join(__dirname, `${templatePath}/${file.type}.template`)).toString();


      const componentClassName = camelize(file.name);
      const [relativePathToModule, moduleToIncliude] = findModuleClassNameInParentFolderRecursively(file.dir, componentClassName);
      let moduleImport = '';
      if (relativePathToModule && moduleToIncliude) {
        moduleImport = `import { ${moduleToIncliude} } from './${relativePathToModule.slice(0, -3)}';`;
      }

      const fileNameWithoutTypeName = file.name.replace(`.${file.type}`, '');
      const content = format(template, {
        templateMainName: camelize(fileNameWithoutTypeName),
        templateFileName: fileNameWithoutTypeName,
        templateModuleToIncliude: moduleToIncliude || 'AppModule',
        templateModuleImport: moduleImport,
        templateItFromMethods: templateItFromMethods
      });
      await createFile(targetUrl, content);
      console.log(chalk.green('create ') + targetUrl);
    }
  }
};


function createFile(url, value) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = fs.createWriteStream(url);
      file.write(value);
      file.end();
      file.on('close', () => {
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// camelize Name
function camelize(str) {
  str = ' ' + str;
  str = clearString(str);
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function clearString(str: string) {
  const pattern = new RegExp(/[.\-_]/);
  let cleanString = '';
  for (let i = 0; i < str.length; i++) {
    cleanString = cleanString + str.substr(i, 1).replace(pattern, ' ');
  }
  return cleanString;
}

function generateItForEachMethod(pathToFile: string) {
  const methodsName = getMethodsNames(pathToFile);
  let template = '';
  if (methodsName && methodsName.length > 0) {
    for (const item of methodsName) {
      template += `\n\tit('${item.name}', () => {\n`;
      if (item.modifier === 'private') {
        template += `\t\texpect(fixture.point.componentInstance['${item.name}']).toBeTruthy();\n`;
      } else {
        template += `\t\texpect(fixture.point.componentInstance.${item.name}).toBeTruthy();\n`;
      }
      template += '\t});\n';
    }
  }
  return template;
}
