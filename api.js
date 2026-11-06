// ========================================================================
// ⚠️ LƯU Ý: THAY ĐƯỜNG LINK WEB APP API CỦA BẠN VÀO DẤU NGOẶC KÉP DƯỚI ĐÂY
// ========================================================================
var SYSTEM_API_URL = "https://script.google.com/macros/s/AKfycbxj0PCNlNQWYGnYXmwVD_aCqt1K3u0uO22uy4Sie01Ddf2lkF4hUYPHaKkWnfzR4QEWjg/exec"; 

var cacheRawServerRows = [];

// Hàm đồng bộ dữ liệu động thời gian thực từ Google Sheets về giao diện Web Pages
function pullDataFromSheetsServer() {
  document.getElementById("screenLoading").style.display = "block";
  document.getElementById("gridContainer").style.display = "none";
  
  fetch(SYSTEM_API_URL + "?action=read")
    .then(res => res.json())
    .then(data => {
      cacheRawServerRows = data;
      renderMatrixExcelTableData(Math.max(cacheRawServerRows.length, 35));
      document.getElementById("screenLoading").style.display = "none";
      document.getElementById("gridContainer").style.display = "block";
    }).catch(err => {
      document.getElementById("screenLoading").innerText = "❌ Không kết nối được tới Máy chủ API. Vui lòng kiểm tra lại cấu hình.";
    });
}

// Khởi chạy tự động kích hoạt tải bảng khi nhân viên vừa mở trang web
window.onload = pullDataFromSheetsServer;
