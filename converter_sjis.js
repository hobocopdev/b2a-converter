
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
    const text = new TextDecoder("shift_jis").decode(event.target.result);
    const rows = text
      .split(/\r?\n/)
      .map(row => row.trim())
      .filter(row => row)
      .map(row => row.split(","));

    if (rows.length < 2) {
      alert("CSVの内容が不正です");
      return;
    }

    const header = rows[0].map(h => h.replace(/^"|"$/g, "").trim());
    const data = rows.slice(1);

    const fieldMap = {"応募日時": "応募日時", "氏名": "氏名（漢字）", "氏名（ふりがな）": "氏名（ふりがな）", "性別": "性別", "生年月日": "生年月日", "電話番号": "電話番号", "メールアドレス": "メールアドレス（PC）", "メールアドレス２": "メールアドレス（携帯）", "現在の職業": "現在の職業", "店舗マスタ名": "応募受付先"};
    const genderMap = { "男": "男性", "女": "女性" };
    const outputHeader = ["応募受付先ID", "応募受付先", "問合せNo", "応募日時", "氏名（漢字）", "氏名（ふりがな）", "生年月日", "性別", "郵便番号コード", "都道府県名", "市区町村名", "住所（その他）", "沿線名", "駅名", "メールアドレス（PC）", "メールアドレス（携帯）", "電話番号", "そのほかの電話番号", "その他連絡事項", "現在の職業", "応募職種", "応募職種の職務経験", "希望する雇用形態", "必要資格", "保有資格"];

    const mappedRows = data.map((row, rowIndex) => {
      const rowObj = {};
      header.forEach((col, i) => {
        const colClean = col.replace(/^"|"$/g, "").trim();
        const value = (row[i] || "").replace(/^"|"$/g, "").trim();
        const mappedCol = fieldMap[colClean] || colClean;

        if (colClean === "性別") {
          rowObj[mappedCol] = genderMap[value] || value;
        } else if (colClean === "電話番号") {
          rowObj[mappedCol] = value.replace(/^TEL\s*/, "");
        } else if (colClean === "店舗マスタ名") {
          rowObj[mappedCol] = value.replace(/^未設定：\s*/, "");
        } else {
          rowObj[mappedCol] = value;
        }
      });
      return outputHeader.map(col => rowObj[col] || "");
    });

    const escape = val => `"{(val || "").replace(/"/g, '""')}"`;
    const csvContent = [outputHeader, ...mappedRows].map(row => row.map(escape).join(",")).join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name.replace(/\.csv$/i, "") + "_converted.csv";
    link.click();

    document.getElementById("status").textContent = "変換完了！（" + link.download + " を保存しました）";
  };

  reader.readAsArrayBuffer(file);
});
