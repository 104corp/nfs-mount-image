const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const app = express();
const port = 8080;

// NFS 路徑
const nfsPath = '/mnt/nfs/';

// 列出 /mnt/nfs 路徑下的所有文件並提供下載連結
app.get('/download', (req, res) => {
  fs.readdir(nfsPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    // 創建文件列表的 HTML
    let fileListHtml = '<h1>文件列表</h1><ul>';
    files.forEach(file => {
      fileListHtml += `<li><a href="/download/${file}">${file}</a></li>`;
    });
    fileListHtml += '</ul>';

    res.send(fileListHtml);
  });
});

// 提供下載單個文件的功能
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(nfsPath, filename);

  // 檢查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    // 下載文件
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  });
});

// 提供下載最新 .tgz 檔案的 API
app.get('/download/latest', (req, res) => {
  fs.readdir(nfsPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    // 過濾出 .tgz 檔案並按日期排序
    const tgzFiles = files.filter(file => file.endsWith('.tgz')).sort((a, b) => {
      const dateA = moment(a, 'YYYYMMDD'); // 假設檔名包含日期如 20230726.tgz
      const dateB = moment(b, 'YYYYMMDD');
      return dateB - dateA;
    });

    if (tgzFiles.length === 0) {
      return res.status(404).send('No .tgz files found');
    }

    const latestFile = tgzFiles[0];
    const filePath = path.join(nfsPath, latestFile);

    // 設置 MIME 類型並下載文件
    res.setHeader('Content-Type', 'application/gzip');
    res.download(filePath, latestFile, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  });
});

// 提供 index.txt 檔案的 API，列出所有 .tgz 檔案
app.get('/index.txt', (req, res) => {
  fs.readdir(nfsPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    // 過濾出 .tgz 檔案
    const tgzFiles = files.filter(file => file.endsWith('.tgz'));

    if (tgzFiles.length === 0) {
      return res.status(404).send('No .tgz files found');
    }

    // 創建 index.txt 內容
    const indexContent = tgzFiles.join('\n');
    const indexPath = path.join(nfsPath, 'index.txt');

    // 寫入 index.txt 檔案
    fs.writeFile(indexPath, indexContent, (err) => {
      if (err) {
        console.error('Error writing index.txt:', err);
        return res.status(500).send('Error writing index.txt');
      }

      // 發送 index.txt 檔案
      res.download(indexPath, 'index.txt', (err) => {
        if (err) {
          console.error('Error downloading index.txt:', err);
          res.status(500).send('Error downloading index.txt');
        }
      });
    });
  });
});

// 提供 /healthcare 的 API，回傳 "hello"
app.get('/healthcare', (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

