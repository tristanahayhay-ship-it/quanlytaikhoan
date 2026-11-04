// ui.js - Xử lý hiển thị Bảng, Thẻ Tag bộ lọc và đóng mở Modal/Dropdown

function renderTable(dataList) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="padding: 30px; color: #bbb; border:none;">没有找到匹配的数据</td></tr>`;
        return;
    }

    dataList.forEach((item) => {
        const originalIndex = currentData.findIndex(dbItem => dbItem.kahao === item.kahao);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" data-index="${originalIndex}" onchange="onRowSelectChange()"></td>
            <td>${item.kashang}</td>
            <td style="color:#00bcff; font-weight:bold;">${item.kahao}</td>
            <td>${item.wallet}</td>
            <td>${item.paoliang}</td>
            <td>${item.mima}</td>
            <td style="color:#ffd700;">${item.beizhu}</td>
            <td>${item.zhuangtai}</td>
        `;
        tbody.appendChild(tr);
    });
    syncColumns();
    onRowSelectChange();
}

function renderTags() {
    const area = document.getElementById('tagsArea');
    area.innerHTML = '';

    if (filterTags.single) createTagElement(`搜索: ${filterTags.single}`, () => { filterTags.single = ""; });
    if (filterTags.batch.length > 0) createTagElement(`帐号: ${filterTags.batch.join(' ')}`, () => { filterTags.batch = []; });
    if (filterTags.group) createTagElement(`搜索: ${filterTags.group}`, () => { filterTags.group = ""; });
}

function createTagElement(text, removeCallback) {
    const area = document.getElementById('tagsArea');
    const tag = document.createElement('div');
    tag.className = 'tag-item';
    tag.innerHTML = `${text} <i class="fa-solid fa-xmark"></i>`;
    tag.querySelector('i').onclick = () => {
        removeCallback();
        renderTags();
        applyFilters();
    };
    area.appendChild(tag);
}

function onRowSelectChange() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    const opsArea = document.getElementById('batchOpsArea');
    const text = document.getElementById('selectedCountText');
    
    if (checkboxes.length > 0) {
        opsArea.style.display = 'flex';
        text.innerText = `已选取 ${checkboxes.length} 个项目`;
    } else {
        opsArea.style.display = 'none';
        document.getElementById('selectAllCheckbox').checked = false;
    }
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAllCheckbox').checked;
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = isChecked);
    onRowSelectChange();
}

function toggleColumnsDropdown() {
    const dropdown = document.getElementById('columnsDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function syncColumns() {
    const checkboxes = document.querySelectorAll('#columnsDropdown input');
    const rows = document.getElementById('mainTable').rows;

    checkboxes.forEach(cb => {
        const colIdx = parseInt(cb.getAttribute('data-col'));
        const isVisible = cb.checked;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[colIdx]) rows[i].cells[colIdx].style.display = isVisible ? '' : 'none';
        }
    });
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if(id === 'addSingleModal') {
        document.getElementById('modalTitle').innerText = '新增账户';
        document.getElementById('editRowIndex').value = '';
    }
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.addEventListener('click', function(e) {
    if (!document.getElementById('btnColumns').contains(e.target) && !document.getElementById('columnsDropdown').contains(e.target)) {
        document.getElementById('columnsDropdown').style.display = 'none';
    }
});
