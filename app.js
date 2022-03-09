const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

// app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("Hello world");
});

app.listen(3000, () => {
  console.log("Hello server");
});

app.post("/pdf", jsonParser, async (req, res) => {
  const pdf = await generatePDF(
    Buffer.from(req.body.html, "base64").toString("UTF-8"),
    req.body.options
  );
  res.contentType("application/pdf");
  res.send(pdf);
});

const generatePDF = async (content, options = {}) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const pdfOptions = {
    format: 'A4',
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
};

  const availableOptions = [
    "scale",
    "displayHeaderFooter",
    "headerTemplate",
    "footerTemplate",
    "printBackground",
    "landscape",
    "pageRanges",
    "format",
    "width",
    "height",
    "margin.top",
    "right",
    "margin.bottom",
    "margin.left",
    "preferCSSPageSize",
  ];
  const integerOptions = ["scale", "width", "height"];
  for (const option of availableOptions) {
    if (options[option] && !option.includes("margin")) {
      if (integerOptions.indexOf(option) > -1) {
        pdfOptions[option] = Number(options[option]);
      } else {
        pdfOptions[option] = options[option];
      }
    }

    if (options[option] && option.includes("margin")) {
      pdfOptions.margin[option.replace("margin.", "")] = options[option];
    }
  }

  // create a new page
  const page = await browser.newPage();

  await page.setContent(content);

  // create a pdf buffer
  const pdfBuffer = await page.pdf(pdfOptions);
  // close the browser
  await browser.close();

  return pdfBuffer;
};
