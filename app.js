// 🔴 THAY ĐƯỜNG LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY
const API_URL = "THAY_DUONG_LINK_APPS_SCRIPT_CUA_BAN_VAO_DAY";

let allData = [];
let currentWallet = "HRPAY-BK";
let table;
let isGrouped = false;
let selectedRowsToDelete = [];

// 1. Tải dữ liệu từ Google Sheets
async function loadSystemData() {
    try {
        const response = await fetch(`${API_URL}?action=read`);
        allData = await response.json();
        renderTable();
    } catch (error) {
        alert("数据加载失败: " + error.message);
    }
}

// 2. Tạo bảng hiển thị dữ liệu thông minh
function renderTable() {
    const filteredData = allData.filter(d => d.loaiVi === currentWallet);
    document.getElementById('total-records').innerText = `当前总计: ${filteredData.length} 行`;

    // Quét trùng lặp
    const cardCounts = {};
    allData.forEach(d => { cardCounts[d.kaHao] = (cardCounts[d.kaHao] || 0) + 1; });

    table = new Tabulator("#main-table", {
        data: filteredData,
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 200, 
        selectable: true, 
        groupBy: isGrouped ? "kaShang" : false, 
        groupHeader: function(value, count){
            return `<span class='text-primary fw-bold'>卡商: ${value}</span> <span class='badge bg-info'>(${count} 个账户)</span>`;
        },
        columns: [
            {formatter:"rowSelection", titleFormatter:"rowSelection", width:50, headerSort:false}, 
            {title:"卡商", field:"kaShang", editor:"input", headerFilter:"input"},
            {title:"卡号", field:"kaHao", editor:"input", headerFilter:"input", 
                formatter: function(cell){
                    var val = cell.getValue();
                    if(cardCounts[val] > 1) {
                        cell.getElement().classList.add("duplicate-alert");
                        return val + " ⚠️ (重复)";
                    }
                    return val;
                }
            },
            {title: currentWallet, field:"viDaiLy", editor:"input"},
            {title:"跑量", field:"paoLiang", editor:"input", sorter:"number"},
            {title:"密码", field:"miMa", editor:"input"},
            {title:"备注", field:"beiZhu", editor:"input"},
            {title:"状态", field:"zhuangTai", editor:"input", headerFilter:"select", headerFilterParams:{values:{"激活":"激活","备用":"备用","冻结":"冻结"}}},
            {title:"操作", formatter:function(){ return "<button class='btn btn-sm btn-primary py-0'>💾 保存</button>"; }, 
                cellClick:function(e, cell){ updateRowData(cell.getRow().getData()); }
            }
        ]
    });
}

// 3. Chuyển tab mục nhỏ
function switchWallet(walletName) {
    currentWallet = walletName;
    document.querySelectorAll('#walletTabs .nav-link').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    renderTable();
}

// 4. Bật tắt gom nhóm 卡商
function toggleGroupByKam商() { isGrouped = !isGrouped; renderTable(); }

// 5. Tìm kiếm hàng loạt quét các cột
document.getElementById('global-search').addEventListener('keyup', function(e){
    const tokens = e.target.value.toLowerCase().split(" ");
    table.clearFilter();
    tokens.forEach(token => {
        if(token) {
            table.addFilter([
                [{field:"kaShang", type:"like", value:token}, {field:"kaHao", type:"like", value:token},
                 {field:"viDaiLy", type:"like", value:token}, {field:"beiZhu", type:"like", value:token}]
            ]);
        }
    });
});

// 6. Lưu dữ liệu thêm hàng loạt
async function submitBulkData() {
    const text = document.getElementById('bulk-input-area').value.trim();
    if(!text) return alert("请先输入数据!");
    const itemsToSubmit = text.split("\n").map(line => {
        const parts = line.split(",");
        return {
            loaiVi: currentWallet, kaShang: parts[0] || "", kaHao: parts[1] || "", viDaiLy: parts[2] || "",
            paoLiang: parts[3] || 0, miMa: parts[4] || "", beiZhu: parts[5] || "", zhuangTai: parts[6] || "激活"
        };
    });
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "add_bulk", items: itemsToSubmit }) });
    const res = await response.json();
    alert(res.message);
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    document.getElementById('bulk-input-area').value = "";
    loadSystemData();
}

// 7. Mở ô cửa sổ liệt kê danh sách trước khi xóa để copy
function prepareDeleteRows() {
    selectedRowsToDelete = table.getSelectedRows();
    if(selectedRowsToDelete.length === 0) return alert("请先勾选需要删除的数据!");
    let deleteListText = selectedRowsToDelete.map((row, index) => {
        let d = row.getData();
        return `${index + 1}. 卡商:${d.kaShang}, 卡号:${d.kaHao}, 钱包:${d.viDaiLy}, 密码:${d.miMa}\n`;
    }).join("");
    document.getElementById('delete-list-area').value = deleteListText;
    document.getElementById('copy-status').innerText = "";
    new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
}

// 8. Copy danh sách sắp xóa
function copyDeleteList() {
    const copyText = document.getElementById("delete-list-area");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    document.getElementById('copy-status').innerText = "✅ 已成功复制!";
}

// 9. Thực hiện xóa hẳn trên Google Sheets
async function executeDeleteRows() {
    const btn = document.getElementById('btn-confirm-delete-action');
    btn.disabled = true;
    const rowNumbers = selectedRowsToDelete.map(row => row.getData().rowNum);
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "delete_bulk", rowNumbers: rowNumbers }) });
    const res = await response.json();
    alert(res.message);
    bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    loadSystemData();
    btn.disabled = false;
}

// 10. Sửa từng dòng trực tiếp
async function updateRowData(rowData) {
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "update", ...rowData }) });
    const res = await response.json();
    alert(res.message);
    loadSystemData();
}

window.addEventListener('DOMContentLoaded', loadSystemData);
