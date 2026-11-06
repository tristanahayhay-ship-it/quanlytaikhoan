var keywordsTenVi = { "1": "HRPAY-Bk", "2": "HRPAY-NA", "3": "BDPAY-BK", "4": "BDPAY-NA" };

function switchTab(tabName) {
  document.querySelectorAll(".tab-item").forEach(el => el.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("txtCurrentTabHeader").innerText = "📊 Ma Trận Phân Hệ " + tabName + " (Đồng bộ Realtime dữ liệu trung tâm)";
}

function capNhatTieuDeFormNhap() {
  var vung = document.getElementById('selectVungHeThong').value;
  document.getElementById('lblTargetInput').innerText = "Khối dữ liệu Excel đưa vào " + keywordsTenVi[vung] + ":";
}

// Chức năng co gọn dòng tìm kiếm hàng loạt độc lập của từng máy nhân viên
function execBatchSearchFilter() {
  var textInput = document.getElementById("areaSearchBatch").value.trim();
  if (!textInput) { alert("⚠️ Vui lòng điền tối thiểu 1 mã thẻ cần lọc!"); return; }
  
  var listMaQuet = textInput.split(/\r?\n/).map(s => s.trim()).filter(s => s !== "");
  var vungChon = document.getElementById("selectVungHeThong").value;
  var baseColumnIndices = { "1": 1, "2": 9, "3": 17, "4": 25 };
  var searchColumnIdx = baseColumnIndices[vungChon];
  
  var tableRows = document.querySelectorAll('#matrixTableBody tr');
  tableRows.forEach(function(tr) {
    var cellTd = tr.children[searchColumnIdx];
    var currentCardCode = cellTd ? cellTd.innerText.trim() : "";
    if (currentCardCode === "") return; 
    
    var hasMatch = listMaQuet.some(ma => currentCardCode.toLowerCase() === ma.toLowerCase());
    if (hasMatch) {
      tr.classList.remove('hidden-tr');
      tr.classList.add('matched-tr');
    } else {
      tr.classList.add('hidden-tr');
    }
  });
  alert("🚀 Quét co gọn dòng trên màn hình làm việc của bạn thành công!");
}

function resetMatrixRowsFilter() {
  document.querySelectorAll('#matrixTableBody tr').forEach(tr => tr.classList.remove('hidden-tr', 'matched-tr'));
  document.getElementById("areaSearchBatch").value = "";
}

// Chức năng gửi dữ liệu Excel dán thô lên Google Sheets để gom nhóm tự động
function submitBulkDataToSheets() {
  if (typeof shutInlineEditor === "function") shutInlineEditor();
  var vungChon = document.getElementById('selectVungHeThong').value;
  var bulkText = document.getElementById('areaRawExcelData').value.trim();
  if (!bulkText) { alert("⚠️ Bạn chưa dán khối nội dung nào từ Excel!"); return; }
  
  var lines = bulkText.split(/\r?\n/);
  var preparedRows = [];
  var tenViChuẩnNhom = keywordsTenVi[vungChon];
  
  lines.forEach(line => {
    var pieces = line.split('\t');
    if (pieces.length >= 2) {
      preparedRows.push([
        pieces[0] ? pieces[0].trim() : "",
        pieces[1] ? pieces[1].trim() : "",
        tenViChuẩnNhom, 
        pieces[3] ? pieces[3].trim() : "5w",
        pieces[4] ? pieces[4].trim() : "",
        pieces[5] ? pieces[5].trim() : "",
        pieces[6] ? pieces[6].trim() : "1"
      ]);
    }
  });

  if (preparedRows.length === 0) return;
  var btn = document.getElementById("btnSubmitForm");
  btn.disabled = true; btn.innerText = "⏳ Hệ thống đang ghi dữ liệu về máy chủ...";

  fetch(SYSTEM_API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "write", vungChon: vungChon, rows: preparedRows })
  }).then(res => res.json())
  .then(res => {
    if (res.success) {
      alert("🚀 Thành công! Dữ liệu gốc đã được lưu và tự động gom nhóm.");
      document.getElementById('areaRawExcelData').value = "";
      pullDataFromSheetsServer(); 
    }
    btn.disabled = false; btn.innerText = "🚀 Xác nhận hoàn thành đẩy lên biểu";
  }).catch(err => {
    alert("❌ Lỗi mạng: Vui lòng kiểm tra lại link cấu hình API tại file api.js.");
    btn.disabled = false; btn.innerText = "🚀 Xác nhận hoàn thành đẩy lên biểu";
  });
}
