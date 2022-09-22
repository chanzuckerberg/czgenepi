import { expect, test } from "@playwright/test";
import { FilterSample } from "../pages/filter";


test.describe("Mock sample API data tests", () => {
  const url = `${process.env.BASEURL}/data/samples/groupId/${process.env.GROUPID}/pathogen/covid`;
  const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
  const today = new Date();
  const daysAgo7 = new Date(today.setDate(today.getDate() - 6));
  const daysAgo30 = new Date(today.setDate(today.getDate() - 30));
  const monthsAgo3 = new Date(today.setDate(today.getDate() - 90));
  const monthsAgo6 = new Date(today.setDate(today.getDate() - 180));
  const lastYear = new Date(today.setDate(today.getDate() - 365));
  const sample = '{"samples":[{"id":18188,"collection_date":"2022-05-05","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.15","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"INTERCEPTED-SAMPLE","public_identifier":"public_1","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"}]}';
  const failedSample = '{"samples":[{"id":18188,"collection_date":"2022-05-05","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":true,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.15","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"INTERCEPTED-SAMPLE","public_identifier":"public_1","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"}]}';
  const lineageSamples = '{"samples":[{"id":18188,"collection_date":"2022-05-05","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_1","public_identifier":"public_1","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"},{"id":18189,"collection_date":"2022-05-05","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.2","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_2","public_identifier":"public_2","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"},{"id":18190,"collection_date":"2022-05-05","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.3","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_3","public_identifier":"public_3","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"}]}'
  const collectionDates = `{"samples":[{"id":18188,"collection_date":"${daysAgo7.getFullYear()+"-"+(daysAgo7.getMonth().toString().length === 1 ? '0'+(daysAgo7.getMonth()+1): (daysAgo7.getMonth())+1) +"-"+(daysAgo7.getDate().toString().length === 1? '0'+daysAgo7.getDate():daysAgo7.getDate())}","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.15","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_1","public_identifier":"public_1","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"},{"id":18189,"collection_date":"${daysAgo30.getFullYear()+"-"+(daysAgo30.getMonth().toString().length === 1 ? '0'+(daysAgo30.getMonth()+1): (daysAgo30.getMonth())+1) +"-"+(daysAgo30.getDate().toString().length === 1? '0'+daysAgo30.getDate():daysAgo30.getDate())}","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.1","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_2","public_identifier":"public_2","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"},{"id":18190,"collection_date":"${monthsAgo3.getFullYear()+"-"+(monthsAgo3.getMonth().toString().length === 1 ? '0'+(monthsAgo3.getMonth()+1): (monthsAgo3.getMonth())+1) +"-"+(monthsAgo3.getDate().toString().length === 1? '0'+monthsAgo3.getDate():monthsAgo3.getDate())}","collection_location":{"id":2605082,"region":"North America","country":"USA","division":"California","location":"Alameda Coutny"},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":"2022-08-09T00:00:00+00:00","lineage":"BA.1.15","confidence":null,"version":"PUSHER-v1.13","scorpio_call":"Omicron (BA.1-like)","scorpio_support":0.93,"qc_status":"pass"},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"private_3","public_identifier":"public_3","sequencing_date":null,"submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":35,"name":"plogan"},"upload_date":"2022-08-05T18:00:48+00:00"},{"id":18191,"collection_date":"${monthsAgo6.getFullYear()+"-"+(monthsAgo6.getMonth().toString().length === 1 ? '0'+(monthsAgo6.getMonth()+1): (monthsAgo6.getMonth())+1) +"-"+(monthsAgo6.getDate().toString().length === 1? '0'+monthsAgo6.getDate():monthsAgo6.getDate())}","collection_location":{"id":167896,"region":"North America","country":"Mexico","division":"Cancun","location":null},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":null,"lineage":null,"confidence":null,"version":null,"scorpio_call":null,"scorpio_support":null,"qc_status":null},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"MAYA-private_identifier_0","public_identifier":"mayita 1","sequencing_date":"2020-03-20","submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":103,"name":"lbrambila@contractor.chanzuckerberg.com"},"upload_date":"2022-08-10T17:50:30+00:00"},{"id":18192,"collection_date":"${lastYear.getFullYear()+"-"+(lastYear.getMonth().toString().length === 1 ? '0'+(lastYear.getMonth()+1): (lastYear.getMonth())+1) +"-"+(lastYear.getDate().toString().length === 1? '0'+lastYear.getDate():lastYear.getDate())}","collection_location":{"id":167896,"region":"North America","country":"Mexico","division":"Cancun","location":null},"czb_failed_genome_recovery":false,"gisaid":{"gisaid_id":null,"status":"Not Found"},"lineage":{"last_updated":null,"lineage":null,"confidence":null,"version":null,"scorpio_call":null,"scorpio_support":null,"qc_status":null},"pathogen":{"id":1,"slug":"SC2","name":"SARS-CoV-2"},"private":false,"private_identifier":"MAYA-private_identifier_1","public_identifier":"mayita 2","sequencing_date":"2020-09-20","submitting_group":{"id":74,"name":"QA Automation"},"uploaded_by":{"id":103,"name":"lbrambila@contractor.chanzuckerberg.com"},"upload_date":"2022-08-10T17:50:30+00:00"}]}`

  test("Should filter by complete genome recovery", async ({ page }) => {
  await page.route(api, route => route.fulfill({
    status: 200,
    body: sample,
  }));
  await page.goto(url);
  await expect(await FilterSample.getStatusBySampleName(page,'INTERCEPTED-SAMPLE')).toBe("complete");
});

test("Should filter by failed genome recovery", async ({ page }) => {
  await page.route(api, route => route.fulfill({
    status: 200,
    body: failedSample,
  }));
  await page.goto(url);
  await expect(await FilterSample.getStatusBySampleName(page,'INTERCEPTED-SAMPLE')).toBe("failed");
});

test("Should filter by lineage", async ({ page }) => {
  await page.route(api, route => route.fulfill({
    status: 200,
    body: lineageSamples,
  }));
  await page.goto(url);
  await FilterSample.filterByLineage(page,'BA.1');
  let actualLineages =  await FilterSample.getColumnContent(page,'BA.1');
  for(let i = 0; i < actualLineages.length; i++){
    await expect(actualLineages[i]).toBe('BA.1');
  }
  await FilterSample.removeSelectedFilter(page);

  await FilterSample.filterByLineage(page,'BA.1.2');
  actualLineages =  await FilterSample.getColumnContent(page,'BA.1.2');
  for(let i = 0; i < actualLineages.length; i++){
    await expect(actualLineages[i]).toBe('BA.1.2');
  }
  await FilterSample.removeSelectedFilter(page);
  await FilterSample.filterByLineage(page,'BA.1.3');
  actualLineages =  await FilterSample.getColumnContent(page,'BA.1.3');
  for(let i = 0; i < actualLineages.length; i++){
    await expect(actualLineages[i]).toBe('BA.1.3');
  }
});

test("Should filter by failed Collection Date", async ({ page }) => {
  await page.route(api, route => route.fulfill({
    status: 200,
    body: collectionDates,
  }));
  await page.goto(url);
  
  await FilterSample.filterBycollectionDate(page,'Last 7 Days');
  //expect
  let collections =  await FilterSample.getColumnContent(page,daysAgo7.getFullYear()+"-"+daysAgo7.getMonth()+"-"+daysAgo7.getDate());
  for(let i = 0; i < collections.length; i++){
    await expect(collections[i]).toBe(daysAgo7.getFullYear()+"-"+daysAgo7.getMonth()+"-"+daysAgo7.getDate());
  }
  await FilterSample.removeSelectedFilter(page);

  await FilterSample.filterBycollectionDate(page,'Last 30 Days');

  //expect
  collections =  await FilterSample.getColumnContent(page,daysAgo30.getFullYear()+"-"+daysAgo30.getMonth()+"-"+daysAgo30.getDate());
  for(let i = 0; i < collections.length; i++){
    await expect(collections[i]).toBe(daysAgo30.getFullYear()+"-"+daysAgo30.getMonth()+"-"+daysAgo30.getDate());
  }

  await FilterSample.removeSelectedFilter(page);

  await FilterSample.filterBycollectionDate(page,'Last 3 Months');
  collections =  await FilterSample.getColumnContent(page,monthsAgo3.getFullYear()+"-"+monthsAgo3.getMonth()+"-"+monthsAgo3.getDate());
  for(let i = 0; i < collections.length; i++){
    await expect(collections[i]).toBe(monthsAgo3.getFullYear()+"-"+monthsAgo3.getMonth()+"-"+monthsAgo3.getDate());
  }

  //expect
  await FilterSample.removeSelectedFilter(page);

  await FilterSample.filterBycollectionDate(page,'Last 6 Months');

  collections =  await FilterSample.getColumnContent(page,monthsAgo6.getFullYear()+"-"+monthsAgo6.getMonth()+"-"+monthsAgo6.getDate());
  for(let i = 0; i < collections.length; i++){
    await expect(collections[i]).toBe(monthsAgo6.getFullYear()+"-"+monthsAgo6.getMonth()+"-"+monthsAgo6.getDate());
  }
  //expect
  await FilterSample.removeSelectedFilter(page);

  await FilterSample.filterBycollectionDate(page,'Last Year');

  collections =  await FilterSample.getColumnContent(page,lastYear.getFullYear()+"-"+lastYear.getMonth()+"-"+lastYear.getDate());
  for(let i = 0; i < collections.length; i++){
    await expect(collections[i]).toBe(lastYear.getFullYear()+"-"+lastYear.getMonth()+"-"+lastYear.getDate());
  }
  //expect
  await FilterSample.removeSelectedFilter(page);

});
});
