const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 5000;

app.use(cors());

// POST /api/merge - receive multiple PDFs and merge them
app.post('/api/merge', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).send('Please upload at least 2 PDF files.');
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdf = await PDFDocument.load(file.buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfFile = await mergedPdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(mergedPdfFile));
  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).send('Failed to merge PDFs.');
  }
});

app.listen(PORT, () => {
  console.log(`PDF Merger API running on http://localhost:${PORT}`);
});
