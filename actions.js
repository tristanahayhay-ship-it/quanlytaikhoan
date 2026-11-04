// actions.js - Bộ xử lý logic thêm, sửa, xóa tài khoản và tìm kiếm nâng cao

function applyFilters() {
    let result = [...currentData];
    const quickKeyword = document.getElementById('quickSearchInput').value.trim().toLowerCase();

    if (filterTags.single) result = result.filter(item => item.kahao === filterTags.single);
    if (filterTags.batch.length > 0) result = result.filter(item => filterTags.batch.includes(item.kahao));
    if (filterTags.group) result = result.filter(item => item.beizhu.toLowerCase().includes(filterTags.group.toLowerCase()));
    
    if (quickKeyword) {
        result = result.filter(item => item.kahao.toLowerCase().includes(quickKeyword) || item.kashang.toLowerCase().includes(quickKeyword));
    }
    renderTable(result);
}

function toggleSearchPanel(panelType) {
    const panels = { batch: document.getElementById('panelBatchSearch'), single: document.getElementById('panelSingleSearch'), group: document.getElementById('panelGroupSearch') };
    const icons = { batch: document.getElementById('btnBatchSearch'), single: document.getElementById('btnSingleSearch'), group: document.getElementById('btnGroupSearch') };

    const isAlreadyOpen = panels[panelType].style.display === 'block';
    closeAllPanels();

    if (!isAlreadyOpen) {
        panels[panelType].style.display = 'block';
        icons[panelType].classList.add('active');
    }
}

function closeAllPanels() {
    ['panelBatchSearch', 'panelSingleSearch', 'panelGroupSearch'].forEach(id => document.getElementById(id).style.display = 'none');
    ['btnBatchSearch', 'btnSingleSearch', 'btnGroupSearch'].forEach(id => document.getElementById(id).classList.remove('active'));
}

function submitSingleSearch() {
    const val = document.getElementById('singleSearchInput').value.trim();
    if (val) { filterTags.single = val; renderTags(); applyFilters(); }
    closeAllPanels();
}

function submitBatchSearch() {
    const lines = document.getElementById('batchSearchInput').value.split('\n');
    const accounts = lines.map(l => l.trim()).filter(l => l !== "");
    if (accounts.length > 0) { filterTags.batch = accounts; renderTags(); applyFilters(); }
    closeAllPanels();
}

function submitGroupSearch() {
    const val = document.getElementById('groupSearchInput').value.trim();
    if (val) { filterTags.group = val; renderTags(); applyFilters(); }
    closeAllPanels();
}

function saveSingleAccount() {
    const kahao = document.getElementById('formKahao').value.trim();
    if (!kahao) { alert('请输入卡号!'); return; }

    const item = {
        kashang: document.getElementById('formKashang').value.trim() || "-",
        kahao: kahao,
        wallet: "HRPAY-BK (代理钱包)",
        paoliang: document.getElementById('formPaoliang').value.trim() || "-",
        mima: document.getElementById('formMima').value.trim() || "-",
        beizhu: document.getElementById('formBeizhu').value.trim() || "-",
        zhuangtai: document.getElementById('formZhuangtai').value.trim() || ""
    };

    currentData.unshift(item);
    saveDataAndRefresh();
    closeModal('addSingleModal');
    ['formKashang', 'formKahao', 'formPaoliang', 'formMima', 'formBeizhu', 'formZhuangtai'].forEach(id => document.getElementById(id).value = '');
}

function saveBatchAccounts() {
    const kashang = document.getElementById('batchKashang').value.trim();
    const kahao = document.getElementById('batchKahao').value.trim();
    const paoliang = document.getElementById('batchPaoliang').value.trim();
    const mima = document.getElementById('batchMima').value.trim();

    if (!kahao) { alert('请输入卡号!'); return; }

    currentData.unshift({
        kashang: kashang || "H001",
        kahao: kahao,
        wallet: "HRPAY-BK (代理钱包)",
        paoliang: paoliang || "5w",
        mima: mima || "",
        beizhu: "",
        zhuangtai: ""
    });

    saveDataAndRefresh();
    closeModal('addBatchModal');
    document.getElementById('batchKahao').value = '';
    document.getElementById('batchMima').value = '';
}

function executeBatchNote() {
    const noteValue = document.getElementById('batchNoteInput').value.trim();
    if (!noteValue) return;

    document.querySelectorAll('.row-checkbox:checked').forEach(cb => {
        const idx = parseInt(cb.getAttribute('data-index'));
        currentData[idx].beizhu = noteValue;
    });

    saveDataAndRefresh();
    closeModal('batchNoteModal');
    document.getElementById('batchNoteInput').value = '';
}

function executeBatchDelete() {
    if (!confirm('确定要删除选中的所有账户吗？')) return;
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    const indexesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a,b) => b - a);
    
    indexesToDelete.forEach(idx => currentData.splice(idx, 1));
    saveDataAndRefresh();
}

// Kích hoạt render bảng lần đầu tiên khi tải trang
renderTable(currentData);
