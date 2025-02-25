const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Helper function to get absolute file path (prevents path traversal attacks)
const getFilePath = (fileName) => path.join(__dirname, '..', 'storage', path.basename(fileName));


const isPDF = (fileName) => path.extname(fileName).toLowerCase() === '.pdf';

router.get('/read', async (req, res) => {
  const { fileName } = req.query;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    const data = await fs.readFile(getFilePath(fileName), 'utf8');
    res.json({ content: data });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

router.post('/append', async (req, res) => {
  const { fileName, content } = req.body;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    await fs.appendFile(getFilePath(fileName), content, 'utf8');
    res.json({ message: 'Content appended successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rename', async (req, res) => {
  const { oldName, newName } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({ error: 'Both old and new file names are required' });
  }

  if (!isPDF(oldName) || !isPDF(newName)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  const oldFilePath = getFilePath(oldName);
  const newFilePath = getFilePath(newName);

  console.log('Old File Path:', oldFilePath); // Debugging
  console.log('New File Path:', newFilePath); // Debugging

  try {
    // Check if the old file exists
    await fs.access(oldFilePath);
    console.log('Old file exists:', oldFilePath); // Debugging

    // Rename the file
    await fs.rename(oldFilePath, newFilePath);
    console.log('File renamed successfully:', newFilePath); // Debugging
    res.json({ message: 'File renamed successfully' });
  } catch (err) {
    console.error('Error during rename:', err); // Debugging
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Old file not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/write', async (req, res) => {
  const { fileName, content } = req.body;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    await fs.writeFile(getFilePath(fileName), content, 'utf8');
    res.json({ message: 'File written successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete', async (req, res) => {
  const { fileName } = req.query;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    await fs.unlink(getFilePath(fileName));
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/create-dir', async (req, res) => {
  const { dirName } = req.body;

  if (!dirName) {
    return res.status(400).json({ error: 'Directory name is required' });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.mkdir(dirPath, { recursive: true }); // Creates nested directories if needed
    res.json({ message: 'Directory created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/delete-dir', async (req, res) => {
  const { dirName } = req.query;

  if (!dirName) {
    return res.status(400).json({ error: 'Directory name is required' });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.rm(dirPath, { recursive: true, force: true }); // Deletes even if it's not empty
    res.json({ message: 'Directory deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;