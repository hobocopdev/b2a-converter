document.getElementById("drop_zone").addEventListener("dragover", function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});

document.getElementById("drop_zone").addEventListener("drop", function(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file.name.endsWith(".csv")) {
    alert("CSVファイルをドロップしてください");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const text = event.target.result;
    const rows = text.split(/\r?\n/).filter(row => row.trim()).map(row => row.split(","));

    if (rows.length < 2) {
      alert("CSVの内容が不正です");
      return;
    }

    const header = rows[0];
    const data = rows.slice(1);

    // B → A のフィールド名変換
    const fieldMap = {
      "受付ID": "問い合わせID",
      "氏名": "名前",
      "フリガナ": "カナ",
      "x": "1",
      "y": "2",
      "z": "3",
      "店舗": "店舗",
      "時間": "受付時間",
      "性別": "性別"
    };

    // 性別コード変換
    const genderMap = {
      "1": "男",
      "2": "女"
    };

    // Aフォーマットの出力順
    const outputHeader = [
      "問い合わせID",
      "1",
      "2",
      "3",
      "名前",
      "カナ",
      "店舗",
      "受付時間",
      "性別"
    ];

    const mappedRows = data.map(row => {
      const rowObj = {};
      header.forEach((col, i) => {
        const mappedCol = fieldMap[col];
        if (mappedCol) {
          if (mappedCol === "性別") {
            rowObj[mappedCol] = genderMap[row[i]] || row[i];
          } else {
            rowObj[mappedCol] = row[i];
          }
        }
      });
      return outputHeader.map(col => rowObj[col] || "");
    });

    const csvContent = [outputHeader, ...mappedRows].map(r => r.join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "b_converted.csv";
    link.click();

    document.getElementById("status").textContent = "✅ 変換完了！（b_converted.csv を保存しました）";
  };

  reader.readAsText(file, "utf-8");
});
