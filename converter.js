// === フィールド定義 ===
const columnsFromB = {
  name: "氏名",
  kana: "氏名（ふりがな）",
  gender: "性別",
  birthday: "生年月日",
  tel: "電話番号",
  email1: "メールアドレス",
  email2: "メールアドレス２",
  occupation: "現在の職業",
  shop: "店舗マスタ名",
  date: "応募日時"
};

const columnsToA = {
  name: "氏名（漢字）",
  kana: "氏名（ふりがな）",
  gender: "性別",
  birthday: "生年月日",
  tel: "電話番号",
  email1: "メールアドレス（PC）",
  email2: "メールアドレス（携帯）",
  occupation: "現在の職業",
  shop: "応募受付先",
  date: "応募日時"
};

const fieldMap = Object.fromEntries(
  Object.keys(columnsFromB).map(key => [columnsFromB[key], columnsToA[key]])
);

const genderMap = {
  "男": "男性",
  "女": "女性"
};

const outputHeader = [
  "応募受付先ID", "応募受付先", "問合せNo", "応募日時", "氏名（漢字）", "氏名（ふりがな）", "生年月日", "性別",
  "郵便番号コード", "都道府県名", "市区町村名", "住所（その他）", "沿線名", "駅名",
  "メールアドレス（PC）", "メールアドレス（携帯）", "電話番号", "そのほかの電話番号", "その他連絡事項",
  "現在の職業", "応募職種", "応募職種の職務経験", "希望する雇用形態", "必要資格", "保有資格"
];

// === CSV処理本体 ===
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

    const mappedRows = data.map(row => {
      const rowObj = {};
      header.forEach((col, i) => {
        const value = row[i];
        const mappedCol = fieldMap[col] || col;

        if (col === columnsFromB.gender) {
          rowObj[mappedCol] = genderMap[value] || value;
        } else if (col === columnsFromB.tel) {
          rowObj[mappedCol] = value?.replace(/^TEL\s*/, "");
        } else if (col === columnsFromB.shop) {
          rowObj[mappedCol] = value?.replace(/^未設定：\s*/, "");
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

    const originalName = file.name.replace(/\.csv$/i, "");
    link.download = originalName + "_converted.csv";
    link.click();

    document.getElementById("status").textContent = "変換完了！（" + link.download + " を保存しました）";
  };

  reader.readAsText(file, "utf-8");
});
