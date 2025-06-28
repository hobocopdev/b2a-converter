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

    const fieldMap = {
      "E": "aD",
      "F": "aE",
      "G": "aF",
      "I": "aH",
      "J": "aG",
      "N": "aQ",
      "P": "aO",
      "R": "aP",
      "U": "aI",
      "W": "aB"
    };

    const genderMap = {
      "男": "男性",
      "女": "女性"
    };

    const outputHeader = [
      "A", "aB", "C", "D", "aD", "aE", "aF", "aG", "H", "aH", "I", "J",
      "K", "L", "M", "aQ", "N", "aO", "O", "aP", "P", "Q", "R", "S", "T",
      "aI", "U", "V", "W", "X", "Y", "Z"
    ];

    const mappedRows = data.map(row => {
      const rowObj = {};
      header.forEach((col, i) => {
        const value = row[i];
        const mappedCol = fieldMap[col] || col;

        if (col === "I") {
          rowObj[mappedCol] = genderMap[value] || value;
        } else if (col === "N") {
          rowObj[mappedCol] = value.replace(/^TEL\\s*/, "");
        } else if (col === "W") {
          rowObj[mappedCol] = value.replace(/^未設定\\s*/, "");
        } else {
          rowObj[mappedCol] = value;
        }
      });
      return outputHeader.map(col => rowObj[col] || "");
    });

    const csvContent = [outputHeader, ...mappedRows].map(r => r.join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    const originalName = file.name.replace(/\\.csv$/i, "");
    link.download = originalName + "_converted.csv";
    link.click();

    document.getElementById("status").textContent = "✅ 変換完了！（" + link.download + " を保存しました）";
  };

  reader.readAsText(file, "utf-8");
});
