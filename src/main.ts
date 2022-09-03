import Puppeteer from "puppeteer";
import fs from "fs";
async function main() {
  const browser = await Puppeteer.launch({});

  const page = await browser.newPage();
  await page.goto("https://github.com/public-apis/public-apis");
  await page.waitForSelector('h3[dir="auto"]');

  // Get all apis section titles
  let objectsResult: object[] | undefined = await page.evaluate(async () => {
    // Get categories h3 elements
    let apisSectionsTitles: Element[] = [
      ...document.querySelectorAll('h3[dir="auto"]'),
    ];
    // Get categories table elements text
    let apisSectionsTables: Element[] = [
      ...document.querySelectorAll('h3[dir="auto"] + table'),
    ];

    // console.log(apisSectionsTitles.length, apisSectionsTables.length);

    // check if the number of titles and tables are the equal to each other, if not, throw an error and return
    if (apisSectionsTitles.length !== apisSectionsTables.length) {
      throw new Error(
        "The number of apis sections titles and tables are not equal"
      );
      return;
    }

    //
    let apisSections: object[] = [];

    loopOverTheCategories: for (let i = 0; i < apisSectionsTitles.length; i++) {
      // init the category apis array
      let apis: object[] = [];

      // Get the category table tbody
      let tableTBody: HTMLTableSectionElement =
        apisSectionsTables[i]!.querySelector("tbody")!;

      // Get the tds of the tbody
      let tableTBodyTr: HTMLTableRowElement[] = [
        ...tableTBody.querySelectorAll("tr"),
      ];

      loopOverTheTdsOfTheTbody: for (let j = 0; j < tableTBodyTr.length; j++) {
        const tr = tableTBodyTr[j];
        let apiName: string = tr.querySelector("td:nth-child(1)")!.textContent!;
        let apiDescription: string =
          tr.querySelector("td:nth-child(2)")!.textContent!;
        let apiAuth: string = tr.querySelector("td:nth-child(3)")!.textContent!;
        let apiHTTPS: string =
          tr.querySelector("td:nth-child(4)")!.textContent!;
        let apiCors: string = tr.querySelector("td:nth-child(5)")!.textContent!;
        let apiLink: string = tr
          .querySelector("td:nth-child(1) > a")!
          .getAttribute("href")!;

        apis.push({
          name: apiName,
          description: apiDescription,
          auth: apiAuth,
          https: apiHTTPS,
          cors: apiCors,
          link: apiLink,
        });
      }

      // then make the object for the whole category
      apisSections.push({
        title: apisSectionsTitles[i].textContent,
        apis: apis,
      });
    }
    return apisSections;
  });

  // after getting all the apis, write them to a json file and save it in result folder
  fs.mkdirSync("result", { recursive: true });
  fs.writeFileSync("./result/apis.json", JSON.stringify(objectsResult));

  // close
  await browser.close();
}

main();
