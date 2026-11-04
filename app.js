        columns: [
            {formatter:"rowSelection", titleFormatter:"rowSelection", width:40, headerSort:false}, // Ô tích chọn hàng loạt
            {title:"卡商", field:"kaShang", editor:"input", headerFilter:"input", width:100},
            {title:"卡号", field:"kaHao", editor:"input", headerFilter:"input", width:150,
                formatter: function(cell){
                    var val = cell.getValue();
                    if(cardCounts[val] > 1) {
                        cell.getElement().classList.add("duplicate-alert");
                        return val + " ⚠️";
                    }
                    return val;
                }
            },
            {title: currentWallet, field:"viDaiLy", editor:"input", width:220}, // Tự động đổi tên cột theo mục nhỏ (HRPAY-BK, HRPAY-NA...)
            {title:"跑量", field:"paoLiang", editor:"input", width:100},
            {title:"密码", field:"miMa", editor:"input", width:120},
            {title:"备注", field:"beiZhu", editor:"input", width:120},
            {title:"状态", field:"zhuangTai", editor:"input", width:100, headerFilter:"select", headerFilterParams:{values:{"激活":"激活","备用":"备用","冻结":"冻结"}}},
            {title:"操作", field:"action_col", width:90, formatter:function(){ return "<button class='btn btn-sm btn-primary py-0' style='font-size:12px;'>💾 保存</button>"; }, 
                cellClick:function(e, cell){ updateRowData(cell.getRow().getData()); }
            }
        ]
