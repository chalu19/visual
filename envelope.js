const docusign = require('docusign-esign')
    , path = require('path')
    , fs = require('fs')
    , process = require('process')
    , basePath = 'https://demo.docusign.net/restapi'
    , express = require('express')
    , envir = process.env
    ;

async function sendEnvelopeController (req, res) {

  const qp =req.query;

  const accessToken = envir.ACCESS_TOKEN || qp.ACCESS_TOKEN || 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwAA0aQGwCTXSAgAABHIFAMl10gCAL3GUbvYCDVLqTV9HZQJvSsVAAEAAAAYAAkAAAAFAAAAKwAAAC0AAAAvAAAAMQAAADIAAAA4AAAAMwAAADUAAAANACQAAABmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgSAAEAAAALAAAAaW50ZXJhY3RpdmUwAIA6DAbAJNdINwBU-gq5htx9Sa5St59MV4ul.iMwrW5JDLGNYLH50d0nguAU9qcedtBaZTurGW63pmMBxLyoCUcGa4WN2cCs5fow3Y4bi5r9YdxPQCB2DBF-0o7YG2pfZzedUSxTwfArKs-JYsqSJOkKBlLNx0v4K-WzTnmvAopLHDdt4FnnUH_X5NTK6DNvpwoKUMC9Q3plBLgVIdPv8xSt8_Z7PsnVZ7UhQQjgigrrySpdDLLkfYN3E0nJPtust4_D8aAzTruqsgPrMdFrbT_UuqcvLt_AODaN0jErn7LjFsDFfdavFuOuY0pnDe3qedzXxszyhFTXhrIazpawBJ0X9dbdqSC3zhM1sA056OYk4kAPfz7tpPTZ-lg';

  const accountId = envir.ACCOUNT_ID || qp.ACCOUNT_ID || '91419477-3866-46ed-bb47-2ec1db7bba22';

  // Recipient Information

  const signerName = envir.USER_FULLNAME || qp.USER_FULLNAME || 'Charissa L';
  const signerEmail = envir.USER_EMAIL || qp.USER_EMAIL || 'charissa.oit@gmail.com';

    // Relative to Repo

  const fileName = 'docs/World_Wide_Corp_lorem.pdf';

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  //EvelopeRequest

  const envDef = new docusign.EnvelopeDefinition();

  envDef.emailSubject = 'Please sign this document';
  envDef.emailBlurb = 'Please sign this document.'

  const pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName))
      , pdfBase64 = pdfBytes.toString('base64');

  const doc = docusign.Document.constructFromObject({documentBase64: pdfBase64,
        fileExtension: 'pdf',
        name: 'Test document', documentId: '1'});

  //DocumentObj

  envDef.documents = [doc];

  const signer = docusign.Signer.constructFromObject({name: signerName,
        email: signerEmail, routingOrder: '1', recipientId: '1'});

  const signHere = docusign.SignHere.constructFromObject({documentId: '1',
        pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
        xPosition: '195', yPosition: '147'});

  signer.tabs = docusign.Tabs.constructFromObject({signHereTabs: [signHere]});

  envDef.recipients = docusign.Recipients.constructFromObject({signers: [signer]});
  envDef.status = 'sent';

  //EvelopeAPI

  let envelopesApi = new docusign.EnvelopesApi()
    , results
    ;

  try {
    results = await envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef})
  } catch  (e) {
    let body = e.response && e.response.body;
    if (body) {
      res.send (`<html lang="en"><body>
                  <h3>API problem</h3><p>Status code ${e.response.status}</p>
                  <p>Error message:</p><p><pre><code>${JSON.stringify(body, null, 4)}</code></pre></p>`);
    } else {
      throw e;
    }
  }
  if (results) {
    res.send (`<html lang="en"><body>
                <h3>Envelope Created!</h3>
                <p>Signer: ${signerName} &lt;${signerEmail}&gt;</p>
                <p>Results</p><p><pre><code>${JSON.stringify(results, null, 4)}</code></pre></p>`);
  }
}

//ExpressJS

const port = process.env.PORT || 3000
    , host = process.env.HOST || 'localhost'
    , app = express()
       .get('/', sendEnvelopeController)
       .listen(port, host);
console.log(`Your server is running on ${host}:${port}`);
