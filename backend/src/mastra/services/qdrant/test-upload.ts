import { uploadDocument } from "./upload-document";

uploadDocument("./sample-contract.pdf")
  .then(console.log)
  .catch(console.error);