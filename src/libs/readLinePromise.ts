
import * as readlineInterface from 'readline';
const readLine = readlineInterface.createInterface({
  input: process.stdin,
  output: process.stdout
});

export function readlinePromise(message: string) {
  return new Promise((resolve, reject) => {

    let userAnswer = '';

    readLine.question(message, (answer) => {
      userAnswer = answer;
      readLine.close();
    });

    readLine.on('close', function () {
      resolve(userAnswer || '');
    });

  });
}
