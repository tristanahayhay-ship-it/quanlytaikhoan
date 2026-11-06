var activeRow = 0, activeCol = 0, isEditing = false, isMouseDown = false, isFillDragging = false;
var startRow = 0, startCol = 0, endRow = 0, endCol = 0;

function getTargetTdCell(r, c) { 
  return document.querySelector('#matrixTableBody td[data-row="'+r+'"][data-col="'+c+'"]'); 
}

function renderMatrixExcelTableData(totalRowsCount) {
  var tbody = document.getElementById('matrixTableBody');
  tbody.innerHTML = "";
  
  for (var i = 0; i < totalRowsCount; i++) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-row', i);
    var rowCellsData = cacheRawServerRows[i] || [];
    
    for (var j = 0; j < 31; j++) {
      var td = document.createElement('td');
      td.setAttribute('data-row', i); 
      td.setAttribute('data-col', j);
      
      if (j === 7 || j === 15 || j === 23) {
        td.className = "gap-column";
        td.innerText = "||";
      } else {
        var textVal = rowCellsData[j] !== undefined ? rowCellsData[j].toString() : "";
        td.innerText = textVal;
        if (textVal.trim() === "暂停") { td.classList.add("status-pause-style"); }
        
        td.onmousedown = function(e) {
          var r = parseInt(this.getAttribute('data-row')), c = parseInt(this.getAttribute('data-col'));
          if (e.target === this && e.offsetX >= this.clientWidth - 8 && e.offsetY >= this.clientHeight - 8 && this.classList.contains('cell-focus')) {
            isFillDragging = true; startRow = activeRow; startCol = activeCol;
          } else {
            isMouseDown = true; shutInlineEditor();
            activeRow = r; activeCol = c; startRow = r; startCol = c; endRow = r; endCol = c;
            updateSelectionStyle();
          }
        };

        td.onmouseenter = function() {
          var r = parseInt(this.getAttribute('data-row')), c = parseInt(this.getAttribute('data-col'));
          if (isMouseDown) { endRow = r; endCol = c; updateSelectionStyle(); }
          else if (isFillDragging) { endRow = r; endCol = activeCol; updateSelectionStyle(); }
        };
        td.ondblclick = function() { launchInlineEditor(this.innerText); };
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

window.onmouseup = function() {
  if (isFillDragging) { applyMouseDragFillCopy(); }
  isMouseDown = false; isFillDragging = false;
};

function updateSelectionStyle() {
  var cells = document.querySelectorAll('#matrixTableBody td:not(.gap-column)');
  var minR = Math.min(startRow, endRow), maxR = Math.max(startRow, endRow);
  var minC = Math.min(startCol, endCol), maxC = Math.max(startCol, endCol);
  cells.forEach(function(td) {
    var r = parseInt(td.getAttribute('data-row')), c = parseInt(td.getAttribute('data-col'));
    td.classList.remove('selected-cell', 'cell-focus');
    if (r >= minR && r <= maxR && c >= minC && c <= maxC) td.classList.add('selected-cell');
    if (r === activeRow && c === activeCol) td.classList.add('cell-focus');
  });
}

function applyMouseDragFillCopy() {
  var srcCell = getTargetTdCell(activeRow, activeCol);
  var srcText = srcCell ? srcCell.innerText : "";
  var minR = Math.min(startRow, endRow), maxR = Math.max(startRow, endRow);
  for (var r = minR; r <= maxR; r++) {
    var targetCell = getTargetTdCell(r, activeCol);
    if (targetCell) targetCell.innerText = srcText;
  }
  startRow = activeRow; endRow = activeRow;
  updateSelectionStyle();
}

function launchInlineEditor(val) {
  if (isEditing) return;
  isEditing = true;
  var cell = getTargetTdCell(activeRow, activeCol), editor = document.getElementById('cellInlineEditor');
  editor.value = val; editor.style.display = 'block';
  cell.appendChild(editor); editor.focus(); editor.select();
}

function shutInlineEditor() {
  if (!isEditing) return;
  var editor = document.getElementById('cellInlineEditor'), cell = getTargetTdCell(activeRow, activeCol);
  if (cell && editor.parentElement === cell) { cell.innerText = editor.value; editor.style.display = 'none'; document.body.appendChild(editor); }
  isEditing = false; updateSelectionStyle();
}

// Phím mũi tên điều hướng nhanh mô phỏng Excel
window.onkeydown = function(e) {
  if (isEditing) {
    if (e.key === "Enter") { e.preventDefault(); shutInlineEditor(); diChuyenO(1, 0); }
    return;
  }
  
  if (e.key === "ArrowDown") { e.preventDefault(); diChuyenO(1, 0); }
  else if (e.key === "ArrowUp") { e.preventDefault(); diChuyenO(-1, 0); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); diChuyenO(0, -1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); diChuyenO(0, 1); }
  else if (e.key === "Enter") { e.preventDefault(); launchInlineEditor(getTargetTdCell(activeRow, activeCol).innerText); }
  else if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    document.querySelectorAll('#matrixTableBody td.selected-cell').forEach(function(td) { td.innerText = ""; });
  }
  else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) { e.preventDefault(); launchInlineEditor(e.key); }
};

function diChuyenO(dr, dc) {
  var nr = activeRow + dr, nc = activeCol + dc;
  if (nc === 7 || nc === 15 || nc === 23) { nc = nc + (dc >= 0 ? 1 : -1); }
  var tbody = document.getElementById('matrixTableBody');
  if (nr >= 0 && nr < tbody.children.length && nc >= 0 && nc < 31) {
    activeRow = nr; activeCol = nc; startRow = nr; startCol = nc; endRow = nr; endCol = nc;
    updateSelectionStyle();
    var targetCell = getTargetTdCell(activeRow, activeCol);
    if(targetCell) targetCell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Xử lý dán dữ liệu đa vùng dạng khối bằng Ctrl+V
window.addEventListener('paste', function(e) {
  if (isEditing) return;
  e.preventDefault();
  var text = (e.clipboardData || window.clipboardData).getData('text');
  var lines = text.split(/\r?\n/);
  if (lines.length === 0) return;

  if (lines.length === 1 && text.indexOf('\t') === -1) {
    var cellVal = text.trim();
    var boiXanhCells = document.querySelectorAll('#matrixTableBody td.selected-cell');
    if (boiXanhCells.length > 1) {
      boiXanhCells.forEach(function(td) { td.innerText = cellVal; });
      return;
    }
  }

  var startR = activeRow;
  lines.forEach(function(line) {
    var cells = line.split('\t');
    var startC = activeCol;
    cells.forEach(function(cellVal) {
      if (startC === 7 || startC === 15 || startC === 23) startC++; 
      var td = getTargetTdCell(startR, startC); 
      if (td) {
        td.innerText = cellVal.trim();
        if(cellVal.trim() === "暂停") { td.classList.add("status-pause-style"); }
        else { td.classList.remove("status-pause-style"); }
      }
      startC++;
    });
    startR++;
  });
  updateSelectionStyle();
});
